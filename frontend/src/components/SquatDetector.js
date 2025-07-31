"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import VideoFeed from './VideoFeed'
import SquatStats from './SquatStats'
import ModeSelector from './ModeSelector'
import VideoUpload from './VideoUpload'

const DEBUG = true

const debugLog = (...args) => {
  if (DEBUG) {
    console.log(`[DEBUG ${new Date().toISOString()}]`, ...args)
  }
}

const SquatDetector = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [mode, setMode] = useState('beginner')
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 })
  const [feedback, setFeedback] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [frameCount, setFrameCount] = useState(0)
  const [activeTab, setActiveTab] = useState('live')
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [previousWorkouts, setPreviousWorkouts] = useState([])
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  
  const isStreamingRef = useRef(false)
  
  const framesSent = useRef(0)
  const framesReceived = useRef(0)
  
  const lastFrameTime = useRef(0)

  const debugStats = {
    framesSent: framesSent.current,
    framesReceived: framesReceived.current,
    wsState: wsRef.current ? wsRef.current.readyState : 'null',
    isStreamingState: isStreaming,
    isStreamingRef: isStreamingRef.current,
    frameCount: frameCount
  }

  // Load stats and previous workouts from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('squatStats')
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      }

      const savedWorkouts = localStorage.getItem('previousWorkouts')
      if (savedWorkouts) {
        setPreviousWorkouts(JSON.parse(savedWorkouts))
      }
    }
  }, [])

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('squatStats', JSON.stringify(stats))
    }
  }, [stats])

  // Save previous workouts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('previousWorkouts', JSON.stringify(previousWorkouts))
    }
  }, [previousWorkouts])

  const stopProcessingFrames = useCallback(() => {
    if (animationRef.current) {
      debugLog('Cancelling animation frame')
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])
  
  const processFrame = useCallback(() => {
    if (!isStreamingRef.current) {
      debugLog('Not streaming (ref check), stopping frame processing')
      return
    }
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas) {
      debugLog('Video or canvas missing, stopping frame processing')
      return
    }
    
    if (video.paused || video.ended) {
      debugLog('Video paused or ended, stopping frame processing')
      return
    }
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      debugLog('WebSocket not connected, skipping frame')
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      debugLog('Could not get canvas context')
      return
    }
    
    const now = performance.now()
    const elapsed = now - lastFrameTime.current
    
    if (elapsed < 100 && framesSent.current > 0) { 
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }
    
    lastFrameTime.current = now
    
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.5)
      
      framesSent.current += 1
      setFrameCount(prev => prev + 1)
      
      if (framesSent.current % 10 === 0) {
        debugLog(`Sending frame #${framesSent.current}`, {
          dataSize: dataURL.length,
          fps: Math.round(1000 / elapsed)
        })
      }
      
      wsRef.current.send(dataURL)
    } catch (err) {
      console.error('Error processing or sending frame:', err)
      debugLog('Error in frame processing:', err)
    }
    
    animationRef.current = requestAnimationFrame(processFrame)
  }, [])
  
  const startProcessingFrames = useCallback(() => {
    debugLog('Starting frame processing')
    if (!wsRef.current) {
      debugLog('WebSocket ref is null, cannot start processing')
      return
    }
    
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      debugLog(`WebSocket not open, current state: ${wsRef.current.readyState}`)
      return
    }
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas) {
      debugLog('Canvas ref is null')
      return
    }
    
    if (!video) {
      debugLog('Video ref is null')
      return
    }
    
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    debugLog(`Canvas size set to ${canvas.width}x${canvas.height}`)
    
    lastFrameTime.current = performance.now()
    animationRef.current = requestAnimationFrame(processFrame)
    debugLog('Frame processing started')
  }, [processFrame])
  
  const playFeedback = useCallback((feedback) => {
    debugLog(`Playing feedback audio: ${feedback}`)
    const audioMap = {
      'reset_counters': '/sounds/reset.mp3',
      'incorrect': '/sounds/incorrect.mp3'
    }
    
    const isNumber = !isNaN(parseInt(feedback))
    const audioFile = isNumber ? `/sounds/count_${feedback}.mp3` : audioMap[feedback]
    
    if (audioFile) {
      debugLog(`Playing audio file: ${audioFile}`)
      const audio = new Audio(audioFile)
      audio.play().catch(e => {
        console.error('Audio play error:', e)
        debugLog('Audio play error:', e)
      })
    } else {
      debugLog(`No audio file found for feedback: ${feedback}`)
    }
  }, [])
  
  const stopStreaming = useCallback(() => {
    debugLog('Stopping video streaming')
    stopProcessingFrames()
    
    isStreamingRef.current = false
    setIsStreaming(false)
    
    if (streamRef.current) {
      debugLog('Stopping media tracks')
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        debugLog(`Stopped track: ${track.kind}`)
      })
      streamRef.current = null
    } else {
      debugLog('No stream to stop')
    }
    
    // Save workout session when stopping
    if (sessionStartTime) {
      const sessionEndTime = new Date()
      const sessionDuration = Math.round((sessionEndTime - sessionStartTime) / 1000)
      
      // Only record sessions longer than 5 seconds
      if (sessionDuration > 5) {
        const newWorkout = {
          date: sessionEndTime.toISOString().split('T')[0],
          correct: stats.correct,
          incorrect: stats.incorrect,
          duration: sessionDuration,
          mode: mode
        }
        
        setPreviousWorkouts(prev => {
          const updated = [newWorkout, ...prev.slice(0, 6)]
          return updated
        })
      }
      
      setSessionStartTime(null)
    }
    
    setProcessedImage(null)
    setFeedback(null)
    framesSent.current = 0
    framesReceived.current = 0
  }, [stopProcessingFrames, sessionStartTime, stats, mode])
  
  const startStreaming = useCallback(async () => {
    debugLog('Starting video streaming')
    try {
      const constraints = { 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { max: 10 }
        }
      }
      
      debugLog('Requesting media with constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      debugLog('Got media stream:', {
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        }))
      })
      
      streamRef.current = stream
      
      if (!videoRef.current) {
        const videoEl = document.createElement('video')
        videoEl.autoplay = true
        videoEl.playsInline = true
        videoEl.muted = true
        videoRef.current = videoEl
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        debugLog('Set stream to video element, waiting for loadedmetadata event')
        
        videoRef.current.onloadedmetadata = () => {
          debugLog('Video metadata loaded', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight
          })
          
          videoRef.current.play()
            .then(() => {
              debugLog('Video playback started')
              isStreamingRef.current = true
              setIsStreaming(true)
              setSessionStartTime(new Date())
              
              setTimeout(() => {
                startProcessingFrames()
              }, 100)
            })
            .catch(error => {
              console.error('Error playing video:', error)
              debugLog('Error playing video:', error)
            })
        }
        
        videoRef.current.onplay = () => debugLog('Video play event fired')
        videoRef.current.onwaiting = () => debugLog('Video waiting for data')
        videoRef.current.onerror = (e) => debugLog('Video error:', e)
      } else {
        debugLog('Video ref is null, cannot attach stream')
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      debugLog('Error accessing camera:', error)
      alert('Unable to access your camera. Please check permissions and try again.')
    }
  }, [startProcessingFrames])
  
  useEffect(() => {
    isStreamingRef.current = isStreaming
    debugLog(`isStreaming state updated: ${isStreaming}`)
  }, [isStreaming])
  
  useEffect(() => {
    debugLog("Initializing WebSocket connection effect")
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
    debugLog("WebSocket URL:", wsUrl)
    
    const connectWebSocket = () => {
      debugLog("Attempting to connect to WebSocket...")
      try {
        wsRef.current = new WebSocket(wsUrl)
        
        wsRef.current.onopen = () => {
          debugLog('WebSocket connected successfully')
          setIsConnected(true)
          const modeMessage = mode === 'beginner' ? 'mode_beginner' : 'mode_pro'
          debugLog('Sending initial mode:', modeMessage)
          wsRef.current.send(modeMessage)
        }
        
        wsRef.current.onclose = (event) => {
          debugLog('WebSocket disconnected', event.code, event.reason)
          setIsConnected(false)
          setIsStreaming(false)
          stopProcessingFrames()
          debugLog('Attempting to reconnect in 3 seconds...')
          setTimeout(connectWebSocket, 3000)
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          debugLog('WebSocket error details:', JSON.stringify(error))
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            const startTime = performance.now()
            const data = JSON.parse(event.data)
            framesReceived.current += 1
            
            if (framesReceived.current % 10 === 0) {
              debugLog(`Received frame #${framesReceived.current}`, {
                hasFeedback: !!data.feedback,
                hasImage: !!data.image,
                imageSize: data.image ? data.image.length : 0,
                squatsCorrect: data.squats_correct,
                squatsIncorrect: data.squats_incorrect
              })
            }
            
            if (data.image) {
              setProcessedImage(data.image)
            }
            
            if (data.feedback) {
              setFeedback(data.feedback)
              if (data.feedback && data.feedback !== 'null') {
                playFeedback(data.feedback)
              }
            }
            
            if (data.squats_correct !== undefined || data.squats_incorrect !== undefined) {
              setStats({
                correct: data.squats_correct || 0,
                incorrect: data.squats_incorrect || 0
              })
            }
            
            if (data.mode_changed) {
              debugLog(`Mode changed to ${data.mode_changed}`)
            }
            
            const processingTime = performance.now() - startTime
            if (processingTime > 50) {
              debugLog(`Message processing took ${processingTime.toFixed(2)}ms`)
            }
          } catch (err) {
            console.error('Error parsing message:', err)
            debugLog('Raw message causing error:', event.data.substring(0, 100) + '...')
          }
        }
      } catch (error) {
        console.error('Error creating WebSocket:', error)
        debugLog('Error creating WebSocket:', error)
        setTimeout(connectWebSocket, 3000)
      }
    }
    
    connectWebSocket()
    
    const statsInterval = setInterval(() => {
      if (isStreamingRef.current) {
        debugLog('Performance stats:', {
          connected: isConnected,
          streaming: isStreamingRef.current,
          framesSent: framesSent.current,
          framesReceived: framesReceived.current,
          fps: frameCount
        })
        setFrameCount(0)
      }
    }, 5000)
    
    return () => {
      debugLog('Cleaning up WebSocket connection')
      clearInterval(statsInterval)
      stopProcessingFrames()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [mode, stopProcessingFrames, playFeedback])
  
  useEffect(() => {
    debugLog(`Mode changed to ${mode}, updating server if connected`)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const modeMessage = mode === 'beginner' ? 'mode_beginner' : 'mode_pro'
      debugLog(`Sending mode change to ${modeMessage}`)
      wsRef.current.send(modeMessage)
    } else {
      debugLog('WebSocket not connected, cannot send mode change')
    }
  }, [mode])
  
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        debugLog('Sending heartbeat')
        wsRef.current.send('heartbeat')
      }
    }, 30000)
    
    return () => clearInterval(heartbeatInterval)
  }, [])

  // Function to clear workout history
  const clearWorkoutHistory = useCallback(() => {
    setPreviousWorkouts([])
    setStats({ correct: 0, incorrect: 0 })
  }, [])

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="mb-8 w-full max-w-5xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <ModeSelector mode={mode} setMode={setMode} />
      </motion.div>
      
      <div className="w-full max-w-5xl mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'live' 
              ? 'text-emerald border-b-2 border-emerald' 
              : 'text-gray-500 hover:text-emerald'}`}
            onClick={() => setActiveTab('live')}
          >
            Live Analysis
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'upload' 
              ? 'text-emerald border-b-2 border-emerald' 
              : 'text-gray-500 hover:text-emerald'}`}
            onClick={() => setActiveTab('upload')}
          >
            Video Upload
          </button>
        </div>
      </div>
      
      <div className="flex flex-col w-full max-w-5xl gap-8">
        {activeTab === 'live' ? (
          <>
            <motion.div 
              className="relative bg-white p-6 rounded-xl shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <VideoFeed 
                videoRef={videoRef} 
                canvasRef={canvasRef}
                isStreaming={isStreaming}
                startStreaming={startStreaming}
                stopStreaming={stopStreaming}
                isConnected={isConnected}
                processedImage={processedImage}
                debugStats={DEBUG ? debugStats : null}
              />
            </motion.div>
            
            <motion.div
              className="bg-white p-6 rounded-xl shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <SquatStats 
                stats={stats} 
                feedback={feedback} 
                previousWorkouts={previousWorkouts}
                clearWorkoutHistory={clearWorkoutHistory}
              />
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-dark mb-4">Workout Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-light rounded-xl p-4 text-center">
                  <h3 className="text-emerald-dark font-semibold mb-2">Session Time</h3>
                  <p className="text-3xl font-bold text-emerald">
                    {isStreaming ? 
                      <span className="flex items-center justify-center">
                        <svg className="w-3 h-3 mr-2 text-pastel animate-pulse" viewBox="0 0 100 100" fill="currentColor">
                          <circle cx="50" cy="50" r="50"/>
                        </svg>
                        LIVE
                      </span> : 
                      "Ready"
                    }
                  </p>
                  <p className="text-sm text-emerald-dark mt-1">{isStreaming ? "Training active" : "Start when ready"}</p>
                </div>
                
                <div className="bg-maximum-light rounded-xl p-4 text-center">
                  <h3 className="text-maximum-dark font-semibold mb-2">Calories Burned</h3>
                  <p className="text-3xl font-bold text-maximum-dark">{stats.correct * 5}</p>
                  <p className="text-sm text-maximum-dark mt-1">estimated</p>
                </div>
                
                <div className="bg-antique rounded-xl p-4 text-center">
                  <h3 className="text-dark font-semibold mb-2">Form Score</h3>
                  <p className="text-3xl font-bold text-emerald">
                    {stats.correct + stats.incorrect === 0 
                      ? "-" 
                      : `${Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%`}
                  </p>
                  <p className="text-sm text-dark mt-1">accuracy</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <VideoUpload mode={mode} />
        )}
      </div>
    </motion.div>
  )
}

export default SquatDetector