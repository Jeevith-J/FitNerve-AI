import base64
import json
import numpy as np
import cv2
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import time
import os
import uuid
from typing import Dict
import re
import logging
import traceback
from datetime import datetime
import imageio
from utils import get_mediapipe_pose
from process_frame import ProcessFrame
from thresholds import get_thresholds_beginner, get_thresholds_pro

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("squat_analyzer")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
connections: Dict[str, Dict] = {}

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Stats for monitoring
stats = {
    "total_frames_received": 0,
    "total_frames_processed": 0,
    "total_frames_failed": 0,
    "total_connections": 0,
    "active_connections": 0,
    "videos_processed": 0,
    "startup_time": datetime.now().isoformat()
}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Initialize connection state
    connection_id = f"{id(websocket)}"
    logger.info(f"New connection accepted: {connection_id}")
    
    connections[connection_id] = {
        "websocket": websocket,
        "mode": "beginner",
        "processor": ProcessFrame(thresholds=get_thresholds_beginner(), flip_frame=True),
        "frames_received": 0,
        "frames_processed": 0,
        "frames_failed": 0,
        "last_frame_time": time.time(),
        "start_time": time.time()
    }
    
    stats["total_connections"] += 1
    stats["active_connections"] += 1
    
    # Initialize pose detection
    pose = get_mediapipe_pose()
    logger.info(f"MediaPipe pose initialized for connection {connection_id}")
    
    # Create a task to monitor connection and log stats
    async def monitor_connection():
        while connection_id in connections:
            conn_data = connections[connection_id]
            elapsed = time.time() - conn_data["start_time"]
            if elapsed > 0 and conn_data["frames_received"] > 0:
                fps = conn_data["frames_processed"] / elapsed
                logger.info(f"Connection {connection_id} stats: "
                            f"received={conn_data['frames_received']}, "
                            f"processed={conn_data['frames_processed']}, "
                            f"failed={conn_data['frames_failed']}, "
                            f"fps={fps:.2f}, "
                            f"mode={conn_data['mode']}")
            await asyncio.sleep(10)  # Log every 10 seconds
    
    monitor_task = asyncio.create_task(monitor_connection())
    
    try:
        while True:
            # Receive data from client with a timeout to detect dead connections
            data = await asyncio.wait_for(
                websocket.receive_text(),
                timeout=30.0  # 30 second timeout
            )
            
            # Track frame timing
            current_time = time.time()
            frame_interval = current_time - connections[connection_id]["last_frame_time"]
            connections[connection_id]["last_frame_time"] = current_time
            
            # Log for debugging if frame interval is unusual
            if frame_interval > 1.0:  # Log if more than 1 second between frames
                logger.warning(f"Long frame interval: {frame_interval:.2f}s for connection {connection_id}")
            
            # Handle mode changes
            if data == "mode_beginner":
                logger.info(f"Setting mode to beginner for {connection_id}")
                connections[connection_id]["mode"] = "beginner"
                connections[connection_id]["processor"] = ProcessFrame(
                    thresholds=get_thresholds_beginner(), 
                    flip_frame=True
                )
                await websocket.send_json({
                    "mode_changed": "beginner"
                })
                continue
                
            elif data == "mode_pro":
                logger.info(f"Setting mode to pro for {connection_id}")
                connections[connection_id]["mode"] = "pro"
                connections[connection_id]["processor"] = ProcessFrame(
                    thresholds=get_thresholds_pro(), 
                    flip_frame=True
                )
                await websocket.send_json({
                    "mode_changed": "pro"
                })
                continue
                
            # Handle heartbeat to keep connection alive
            elif data == "heartbeat":
                logger.debug(f"Received heartbeat from {connection_id}")
                await websocket.send_json({"status": "ok"})
                continue
            
            # Process image data
            if data.startswith('data:image'):
                start_time = time.time()
                
                # Update frame counters
                connections[connection_id]["frames_received"] += 1
                stats["total_frames_received"] += 1
                
                frame_count = connections[connection_id]["frames_received"]
                
                # Log every 10th frame for performance monitoring
                if frame_count % 10 == 0:
                    logger.debug(f"Processing frame #{frame_count} from {connection_id}")
                
                try:
                    # Extract base64 image data
                    base64_data = re.sub('^data:image/.+;base64,', '', data)
                    
                    # Log data length for debugging
                    data_length = len(base64_data)
                    if frame_count % 30 == 0:
                        logger.debug(f"Frame #{frame_count} data length: {data_length} bytes")
                    
                    if data_length < 1000:
                        logger.warning(f"Very small image data received: {data_length} bytes")
                    
                    # Decode base64
                    try:
                        img_bytes = base64.b64decode(base64_data)
                    except Exception as e:
                        logger.error(f"Base64 decode error: {str(e)}")
                        continue
                    
                    # Convert to numpy array
                    img_array = np.frombuffer(img_bytes, np.uint8)
                    
                    # Decode image
                    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                    
                    if frame is None or frame.size == 0:
                        logger.warning(f"Decoded empty frame from connection {connection_id}")
                        connections[connection_id]["frames_failed"] += 1
                        stats["total_frames_failed"] += 1
                        continue
                    
                    # Log frame shape occasionally
                    if frame_count % 30 == 0:
                        logger.debug(f"Frame shape: {frame.shape}")
                    
                    # Make sure frame has right color format (BGR for OpenCV)
                    if len(frame.shape) == 2:  # Grayscale
                        frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
                    elif frame.shape[2] == 4:  # RGBA
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                    
                    # Process frame
                    processor = connections[connection_id]["processor"]
                    processed_frame, feedback = processor.process(frame, pose)
                    
                    # Update successful processing counter
                    connections[connection_id]["frames_processed"] += 1
                    stats["total_frames_processed"] += 1
                    
                    # Convert processed frame back to base64
                    _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    processed_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    # Calculate processing time
                    process_time = time.time() - start_time
                    if process_time > 0.1:  # Log if processing takes > 100ms
                        logger.debug(f"Frame #{frame_count} processing time: {process_time:.3f}s")
                    
                    # Send processed frame and stats
                    response_data = {
                        "image": f"data:image/jpeg;base64,{processed_base64}",
                        "feedback": feedback if feedback else None,
                        "squats_correct": processor.state_tracker['SQUAT_COUNT'],
                        "squats_incorrect": processor.state_tracker['IMPROPER_SQUAT'],
                        "process_time_ms": int(process_time * 1000)
                    }
                    
                    await websocket.send_json(response_data)
                    
                except Exception as e:
                    connections[connection_id]["frames_failed"] += 1
                    stats["total_frames_failed"] += 1
                    logger.error(f"Error processing frame: {str(e)}")
                    logger.error(traceback.format_exc())
                    
                    # Try to send error message to client
                    try:
                        await websocket.send_json({
                            "error": f"Frame processing error: {str(e)}"
                        })
                    except:
                        pass
            else:
                logger.warning(f"Received unknown message from {connection_id}: {data[:30]}...")
    
    except asyncio.TimeoutError:
        logger.warning(f"Connection {connection_id} timed out")
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"Error in websocket connection {connection_id}: {str(e)}")
        logger.error(traceback.format_exc())
    finally:
        # Clean up connection
        if connection_id in connections:
            # Log final stats
            conn_data = connections[connection_id]
            elapsed = time.time() - conn_data["start_time"]
            logger.info(f"Connection {connection_id} closed. "
                      f"Stats: received={conn_data['frames_received']}, "
                      f"processed={conn_data['frames_processed']}, "
                      f"failed={conn_data['frames_failed']}, "
                      f"duration={elapsed:.1f}s")
            
            del connections[connection_id]
            stats["active_connections"] -= 1
        
        # Cancel the monitoring task
        monitor_task.cancel()

def process_video_file(video_path, output_path, mode="beginner"):
    logger.info(f"Processing video file: {video_path}, mode: {mode}")
    
    # Get appropriate thresholds based on mode
    thresholds = get_thresholds_beginner() if mode == "beginner" else get_thresholds_pro()
    
    # Initialize processor and pose detector
    processor = ProcessFrame(thresholds=thresholds, flip_frame=True)
    pose = get_mediapipe_pose()
    
    # Open video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Could not open video file: {video_path}")
        return None
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    logger.info(f"Video properties: {width}x{height} @ {fps} fps, {frame_count} frames")
    
    # Create video writer for output
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Process each frame
    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_idx += 1
        if frame_idx % 30 == 0:
            logger.info(f"Processing frame {frame_idx}/{frame_count}")
        
        # Process frame
        processed_frame, _ = processor.process(frame, pose)
        
        # Write processed frame to output video
        out.write(processed_frame)
    
    # Release resources
    cap.release()
    out.release()
    
    # Return stats
    return {
        "correct_squats": processor.state_tracker['SQUAT_COUNT'],
        "incorrect_squats": processor.state_tracker['IMPROPER_SQUAT'],
        "total_frames": frame_idx,
        "processed_video_path": output_path
    }

@app.post("/upload-video")
async def upload_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...), 
    mode: str = Form("beginner")
):
    # Validate mode
    if mode not in ["beginner", "pro"]:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid mode. Must be 'beginner' or 'pro'"}
        )
    
    # Generate unique ID for the video
    video_id = str(uuid.uuid4())
    
    # Create file paths
    video_filename = f"{video_id}_{video.filename}"
    video_path = os.path.join(UPLOAD_DIR, video_filename)
    output_path = os.path.join(PROCESSED_DIR, f"processed_{video_filename}")
    
    # Save the uploaded file
    try:
        with open(video_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
        
        logger.info(f"Video saved to {video_path}, queuing for processing...")
        
        # Process video in background
        background_tasks.add_task(process_video_and_update_client, video_path, output_path, mode, video_id)
        
        # Return immediate response with job ID
        return JSONResponse(
            status_code=202,
            content={
                "message": "Video uploaded successfully and queued for processing",
                "video_id": video_id,
                "status": "processing"
            }
        )
        
    except Exception as e:
        logger.error(f"Error saving video: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error uploading video: {str(e)}"}
        )

# Global dictionary to store processing results
video_results = {}

def process_video_and_update_client(video_path, output_path, mode, video_id):
    try:
        # Update status
        video_results[video_id] = {"status": "processing"}
        
        # Process the video
        result = process_video_file(video_path, output_path, mode)
        
        if result:
            stats["videos_processed"] += 1
            
            # Get a frame from the processed video to use as a thumbnail
            cap = cv2.VideoCapture(output_path)
            ret, frame = cap.read()
            thumbnail_path = None
            
            if ret:
                thumbnail_path = os.path.join(PROCESSED_DIR, f"thumb_{video_id}.jpg")
                cv2.imwrite(thumbnail_path, frame)
            
            cap.release()
            
            # Convert mp4 to gif
            gif_path = os.path.join(PROCESSED_DIR, f"processed_{video_id}.gif")
            convert_video_to_gif(output_path, gif_path)
            
            # Update results
            video_results[video_id] = {
                "status": "completed",
                "result": {
                    "correct_squats": result["correct_squats"],
                    "incorrect_squats": result["incorrect_squats"],
                    "processed_video_url": f"http://127.0.0.1:8000/api/videos/{os.path.basename(gif_path)}",
                    "thumbnail_url": f"http://127.0.0.1:8000/api/thumbnails/{os.path.basename(thumbnail_path)}" if thumbnail_path else None,
                    "video_id": video_id,
                    "mode": mode
                }
            }
            print(video_results[video_id])
            
            logger.info(f"Video {video_id} processed successfully: {result['correct_squats']} correct, {result['incorrect_squats']} incorrect squats")
        else:
            video_results[video_id] = {
                "status": "failed",
                "error": "Video processing failed"
            }
            logger.error(f"Video {video_id} processing failed")
            
    except Exception as e:
        logger.error(f"Error processing video {video_id}: {str(e)}")
        logger.error(traceback.format_exc())
        video_results[video_id] = {
            "status": "failed",
            "error": str(e)
        }

def convert_video_to_gif(video_path, gif_path, fps=10):
    """
    Convert an MP4 video to GIF format
    
    Args:
        video_path: Path to the input video file
        gif_path: Path where the output GIF will be saved
        fps: Frames per second in the output GIF (lower = smaller file)
    """
    try:
        logger.info(f"Converting video to GIF: {video_path} -> {gif_path}")
        
        # Read the video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video file for GIF conversion: {video_path}")
            return False
        
        # Get video properties
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Calculate the frame step to achieve target FPS
        # For example, if video is 30fps and we want 10fps, we take every 3rd frame
        step = max(1, round(video_fps / fps))
        
        frames = []
        frame_idx = 0
        
        logger.info(f"Reading frames for GIF, using every {step}th frame")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Only use every nth frame
            if frame_idx % step == 0:
                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Resize to reduce file size if needed
                # You can adjust the scale factor as needed
                width = int(frame.shape[1] * 0.5)  # 50% of original width
                height = int(frame.shape[0] * 0.5)  # 50% of original height
                resized = cv2.resize(rgb_frame, (width, height))
                
                frames.append(resized)
                
                if len(frames) % 10 == 0:
                    logger.debug(f"Collected {len(frames)} frames for GIF")
            
            frame_idx += 1
            
            # Optional: limit the number of frames to keep GIF size reasonable
            if len(frames) >= 100:  # You can adjust this limit
                logger.warning(f"Limiting GIF to 100 frames to control file size")
                break
        
        cap.release()
        
        if not frames:
            logger.error("No frames extracted for GIF")
            return False
            
        logger.info(f"Writing GIF with {len(frames)} frames")
        
        # Write GIF
        imageio.mimsave(gif_path, frames, format='GIF', fps=fps, loop=0, duration=1000/fps)
        
        # Check if GIF was created successfully
        if os.path.exists(gif_path):
            gif_size = os.path.getsize(gif_path) / (1024 * 1024)  # Size in MB
            logger.info(f"GIF created successfully: {gif_path} ({gif_size:.2f} MB)")
            return True
        else:
            logger.error(f"Failed to create GIF: {gif_path}")
            return False
            
    except Exception as e:
        logger.error(f"Error converting video to GIF: {str(e)}")
        logger.error(traceback.format_exc())
        return False

@app.get("/video-status/{video_id}")
async def get_video_status(video_id: str):
    if video_id not in video_results:
        return JSONResponse(
            status_code=404,
            content={"error": "Video ID not found"}
        )
    
    return video_results[video_id]

@app.get("/api/videos/{video_name}")
async def get_video(video_name: str):
    from fastapi.responses import FileResponse
    
    # Check if the file exists
    video_path = os.path.join(PROCESSED_DIR, video_name)
    if not os.path.isfile(video_path):
        return JSONResponse(
            status_code=404,
            content={"error": "Video not found"}
        )
    
    # Determine the correct media type based on file extension
    file_extension = os.path.splitext(video_name)[1].lower()
    
    if file_extension == '.gif':
        media_type = "image/gif"
    elif file_extension == '.mp4':
        media_type = "video/mp4"
    else:
        media_type = "application/octet-stream"
    
    # Serve the file
    return FileResponse(
        video_path, 
        media_type=media_type, 
        filename=video_name
    )


@app.get("/api/thumbnails/{thumbnail_name}")
async def get_thumbnail(thumbnail_name: str):
    from fastapi.responses import FileResponse
    thumbnail_path = os.path.join(PROCESSED_DIR, thumbnail_name)
    if not os.path.isfile(thumbnail_path):
        return JSONResponse(
            status_code=404,
            content={"error": "Thumbnail not found"}
        )
    
    return FileResponse(
        thumbnail_path, 
        media_type="image/jpeg", 
        filename=thumbnail_name
    )

@app.get("/")
def read_root():
    return {
        "status": "AI Fitness Trainer API is running",
        "stats": stats,
        "active_connections": len(connections)
    }

@app.get("/stats")
def get_stats():
    active_conn_stats = []
    for conn_id, conn_data in connections.items():
        # Calculate connection stats
        elapsed = time.time() - conn_data["start_time"]
        fps = conn_data["frames_processed"] / max(elapsed, 0.001)
        
        active_conn_stats.append({
            "connection_id": conn_id,
            "mode": conn_data["mode"],
            "frames_received": conn_data["frames_received"],
            "frames_processed": conn_data["frames_processed"],
            "frames_failed": conn_data["frames_failed"],
            "uptime_seconds": round(elapsed),
            "fps": round(fps, 2),
            "squats_correct": conn_data["processor"].state_tracker['SQUAT_COUNT'],
            "squats_incorrect": conn_data["processor"].state_tracker['IMPROPER_SQUAT']
        })
    
    return {
        "server_stats": stats,
        "active_connections": active_conn_stats,
        "server_uptime_seconds": round(time.time() - time.mktime(datetime.fromisoformat(stats["startup_time"]).timetuple()))
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AI Fitness Trainer API server")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="debug")