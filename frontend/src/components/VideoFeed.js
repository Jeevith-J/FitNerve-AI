"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const VideoFeed = ({ 
  videoRef, 
  canvasRef, 
  isStreaming, 
  startStreaming, 
  stopStreaming, 
  isConnected,
  processedImage,
  debugStats = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  const expandedVariants = {
    normal: {
      position: 'relative',
      width: '100%',
      height: 'auto',
      zIndex: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      x: 0,
      y: 0,
      zIndex: 50,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }
  
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  const toggleExpand = () => {
    if (!isStreaming) return
    setIsExpanded(!isExpanded)
    
    if (!isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }
  
  const handleVideoError = () => {
    setVideoFailed(true)
  }

  // This will be our base video element that's always hidden
  // It's needed for capturing the camera stream
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.onError = handleVideoError
    }
    
    return () => {
      if (videoElement) {
        videoElement.onError = null
      }
    }
  }, [videoRef])

  return (
    <div>
      {/* Hidden video element for processing */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="hidden absolute"
        onError={handleVideoError}
      />

      {/* Main container */}
      <motion.div 
        className="relative"
        variants={expandedVariants}
        initial="normal"
        animate={isExpanded ? "expanded" : "normal"}
      >
        {/* Backdrop when expanded */}
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            variants={overlayVariants}
            onClick={toggleExpand}
          />
        )}
        
        {/* Feed display container */}
        <div className="bg-cosmic rounded-lg overflow-hidden" style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Not streaming state */}
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cosmic">
              <svg 
                className="w-20 h-20 text-emerald-light mb-3" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-dark text-lg font-medium">
                Camera is off
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Click "Start Camera" to begin
              </p>
            </div>
          )}
          
          {/* Error state */}
          {videoFailed && isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cosmic/90">
              <svg 
                className="w-20 h-20 text-pastel mb-3" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-dark text-lg font-medium">
                Video stream unavailable
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Please check camera permissions and try again
              </p>
            </div>
          )}
          
          {/* Processed feed */}
          {isStreaming && !videoFailed && processedImage && (
            <div className="relative" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={processedImage} 
                alt="Processed feed" 
                className="rounded-lg"
                key={processedImage.substring(0, 50)}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: isExpanded ? '100vh' : '480px',
                  objectFit: isExpanded ? 'contain' : 'initial',
                  width: isExpanded ? '100%' : 'auto',
                  height: isExpanded ? '100%' : 'auto',
                  cursor: isExpanded ? 'zoom-out' : 'zoom-in'
                }}
                onClick={toggleExpand}
              />
              
              {/* Camera controls */}
              <motion.div 
                className="absolute top-3 right-3 flex space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand()
                  }}
                >
                  {isExpanded ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 9L4 4M4 4V9M4 4H9M15 9L20 4M20 4V9M20 4H15M9 15L4 20M4 20V15M4 20H9M15 15L20 20M20 20V15M20 20H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8V4M4 4H8M4 4L9 9M20 8V4M20 4H16M20 4L15 9M4 16V20M4 20H8M4 20L9 15M20 16V20M20 20H16M20 20L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </motion.button>
                
                {debugStats && (
                  <motion.button
                    className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLogs(!showLogs)
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                )}
              </motion.div>
              
              {/* Status bar */}
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white p-2 px-3 flex justify-between items-center text-sm">
                  <span>Camera Active</span>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-1.5 ${isConnected ? 'bg-emerald' : 'bg-maximum'}`}></div>
                    <span className="text-xs">{isConnected ? 'Connected' : 'Connecting...'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* No processed image but streaming */}
          {isStreaming && !videoFailed && !processedImage && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-maximum animate-pulse">
                Waiting for processed feed...
              </div>
            </div>
          )}
        </div>
        
        {/* Debug logs */}
        {debugStats && showLogs && (
          <div className="absolute top-12 right-3 w-72 bg-black/80 backdrop-blur-md text-white p-3 rounded-lg text-xs font-mono">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/20">
              <h3 className="font-semibold">Connection Logs</h3>
              <button
                onClick={() => setShowLogs(false)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {Object.entries(debugStats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-emerald-light">{key}:</span>
                  <span className="text-maximum-light">{value.toString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Expanded view controls */}
        {isExpanded && isStreaming && !videoFailed && (
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                stopStreaming()
                setIsExpanded(false)
              }}
              className="bg-pastel hover:bg-pastel-light text-white p-3 rounded-full shadow transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="text-white flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald' : 'bg-maximum'}`}></div>
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Hidden canvas for processing */}
      <canvas 
        ref={canvasRef} 
        width="640" 
        height="480" 
        className="hidden"
      />
      
      {/* Connection details */}
      <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-emerald mb-2">Connection Details</h3>
        <div className="flex items-center space-x-2 mb-1">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald' : 'bg-maximum'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-emerald' : 'text-maximum'}`}>
            {isConnected ? 'Server Connected' : 'Server Disconnected'}
          </span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <div className={`h-3 w-3 rounded-full ${isStreaming && !videoFailed ? 'bg-emerald' : 'bg-pastel'}`}></div>
          <span className={`text-sm font-medium ${isStreaming && !videoFailed ? 'text-emerald' : 'text-pastel'}`}>
            {isStreaming && !videoFailed ? 'Camera Streaming' : 'Camera Inactive'}
          </span>
        </div>
        {videoFailed && isStreaming && (
          <div className="text-pastel text-sm mt-2 p-2 bg-pastel-light/20 rounded-md">
            Video stream failed to load. Please check your camera permissions or try a different browser.
          </div>
        )}
      </div>
      
      {/* Control buttons */}
      <div className="mt-4">
        {!isExpanded && (
          <div className="flex justify-between items-center">
            {isConnected ? (
              !isStreaming ? (
                <button
                  onClick={startStreaming}
                  className="bg-emerald hover:bg-emerald-light text-white font-medium py-2 px-6 rounded-lg shadow transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopStreaming}
                  className="bg-pastel hover:bg-pastel-light text-white font-medium py-2 px-6 rounded-lg shadow transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Stop Camera</span>
                </button>
              )
            ) : (
              <div className="text-maximum-dark font-medium flex items-center">
                <div className="h-3 w-3 rounded-full bg-maximum mr-2"></div>
                Connecting to server...
              </div>
            )}
            
            {videoFailed && isStreaming && (
              <button
                onClick={() => {
                  setVideoFailed(false)
                  startStreaming()
                }}
                className="text-emerald hover:text-emerald-light font-medium"
              >
                Retry Camera
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoFeed