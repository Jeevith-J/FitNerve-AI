"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import UploadIndicator from './UploadIndicator'
import SquatStats from './SquatStats'

const VideoUpload = ({ mode }) => {
	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState(null)
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [result, setResult] = useState(null)
	const [error, setError] = useState(null)
	const [pollingInterval, setPollingInterval] = useState(null)
	const [stats, setStats] = useState({ correct: 0, incorrect: 0 })
	const [previousWorkouts, setPreviousWorkouts] = useState([])
	const fileInputRef = useRef(null)

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

	const handleDragOver = (e) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = () => {
		setIsDragging(false)
	}

	const handleDrop = (e) => {
		e.preventDefault()
		setIsDragging(false)
		
		const files = e.dataTransfer.files
		if (files.length > 0 && files[0].type.startsWith('video/')) {
			setFile(files[0])
			setError(null)
		} else {
			setError('Please upload a video file')
		}
	}

	const handleFileChange = (e) => {
		const files = e.target.files
		if (files.length > 0) {
			setFile(files[0])
			setError(null)
		}
	}

	const handleUpload = async () => {
		if (!file) {
			setError('Please select a video file')
			return
		}

		setUploading(true)
		setUploadProgress(0)
		setError(null)
		
		const formData = new FormData()
		formData.append('video', file)
		formData.append('mode', mode)

		try {
			const response = await fetch('http://localhost:8000/upload-video', {
				method: 'POST',
				body: formData
			})

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.statusText}`)
			}

			const data = await response.json()
			
			if (data.video_id) {
				startPolling(data.video_id)
			} else {
				throw new Error('No video ID received from server')
			}
			
		} catch (err) {
			setError(`Upload failed: ${err.message}`)
			setUploading(false)
		}
	}

	const startPolling = (videoId) => {
		setUploadProgress(50)
		
		// Clear any existing interval
		if (pollingInterval) {
			clearInterval(pollingInterval)
		}
		
		// Start polling for status
		const interval = setInterval(async () => {
			try {
				const response = await fetch(`http://localhost:8000/video-status/${videoId}`)
				const data = await response.json()
				
				if (data.status === 'completed') {
					// Process and save the results
					processResults(data.result)
					setResult(data.result)
					setUploading(false)
					setUploadProgress(100)
					clearInterval(interval)
					setPollingInterval(null)
				} else if (data.status === 'failed') {
					setError(`Processing failed: ${data.error || 'Unknown error'}`)
					setUploading(false)
					clearInterval(interval)
					setPollingInterval(null)
				} else {
					// Still processing, update progress
					setUploadProgress(70)  // We can't know exact progress so just show something
				}
			} catch (err) {
				console.error('Error checking status:', err)
				// Don't stop polling on temporary errors
			}
		}, 3000)  // Check every 3 seconds
		
		setPollingInterval(interval)
	}

	const processResults = (resultData) => {
		if (!resultData) return
		
		// Update stats with the new correct and incorrect squats
		const updatedStats = {
			correct: stats.correct + (resultData.correct_squats || 0),
			incorrect: stats.incorrect + (resultData.incorrect_squats || 0)
		}
		
		// Save updated stats to state and localStorage
		setStats(updatedStats)
		localStorage.setItem('squatStats', JSON.stringify(updatedStats))
		
		// Create a new workout record
		const newWorkout = {
			date: new Date().toISOString().split('T')[0],
			correct: resultData.correct_squats || 0,
			incorrect: resultData.incorrect_squats || 0,
			duration: resultData.duration_seconds || 60, // Default to 60 seconds if not provided
			mode: resultData.mode || mode,
			isVideo: true // Mark as video upload
		}
		
		// Update previous workouts
		const updatedWorkouts = [newWorkout, ...previousWorkouts.slice(0, 6)]
		setPreviousWorkouts(updatedWorkouts)
		localStorage.setItem('previousWorkouts', JSON.stringify(updatedWorkouts))
	}

	const resetUpload = () => {
		setFile(null)
		setResult(null)
		setError(null)
		setUploading(false)
		setUploadProgress(0)
		
		if (pollingInterval) {
			clearInterval(pollingInterval)
			setPollingInterval(null)
		}
	}
	
	// Function to clear workout history
	const clearWorkoutHistory = () => {
		setStats({ correct: 0, incorrect: 0 })
		setPreviousWorkouts([])
		localStorage.setItem('squatStats', JSON.stringify({ correct: 0, incorrect: 0 }))
		localStorage.setItem('previousWorkouts', JSON.stringify([]))
	}

	return (
		<>
			<motion.div 
				className="bg-white p-6 rounded-xl shadow-xl mb-8"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.4 }}
			>
				<h2 className="text-2xl font-semibold text-dark mb-4">Video Analysis</h2>
				
				{!result ? (
					<>
						<div 
							className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
								isDragging ? 'border-emerald bg-emerald-light/20' : 'border-gray-300'
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="video/*"
								className="hidden"
							/>
							
							{file ? (
								<div>
									<div className="flex items-center justify-center mb-3">
										<svg className="w-10 h-10 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" 
												stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</div>
									<p className="text-emerald font-medium">{file.name}</p>
									<p className="text-gray-500 text-sm mt-1">
										{(file.size / (1024 * 1024)).toFixed(2)} MB
									</p>
								</div>
							) : (
								<div>
									<div className="flex items-center justify-center mb-3">
										<svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M7 16.5L12 21.5M12 21.5L17 16.5M12 21.5L12 9.5M16 7.5C16 9.70914 14.2091 11.5 12 11.5C9.79086 11.5 8 9.70914 8 7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5Z" 
												stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</div>
									<p className="font-medium">Drag & drop a video here or click to browse</p>
									<p className="text-gray-500 text-sm mt-1">
										Support for MP4, MOV, AVI, and other common video formats
									</p>
								</div>
							)}
							
							<button
								onClick={() => fileInputRef.current.click()}
								className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
							>
								Select Video
							</button>
						</div>
						
						{error && (
							<div className="mt-4 p-3 bg-pastel-light/20 border border-pastel-light rounded-lg text-pastel">
								{error}
							</div>
						)}
						
						<div className="mt-6 flex justify-between">
							<button
								onClick={resetUpload}
								className="px-4 py-2 text-gray-600 hover:text-gray-800"
								disabled={uploading || !file}
							>
								Reset
							</button>
							
							<button
								onClick={handleUpload}
								disabled={uploading || !file}
								className={`px-6 py-2 rounded-lg text-white transition-colors ${
									uploading || !file 
										? 'bg-gray-400 cursor-not-allowed' 
										: 'bg-emerald hover:bg-emerald-light'
								}`}
							>
								{uploading ? 'Processing...' : 'Analyze Video'}
							</button>
						</div>
						
						{uploading && (
							<UploadIndicator 
								progress={uploadProgress}
								status={
									uploadProgress < 40 
										? 'Uploading video...' 
										: uploadProgress < 90
											? 'Processing video...'
											: 'Finalizing results...'
								}
							/>
						)}
					</>
				) : (
					<div className="space-y-6">
						<div className="flex flex-col md:flex-row gap-6">
							<div className="md:w-2/3">
								<div className="bg-cosmic rounded-lg overflow-hidden">
{result.processed_video_url ? (
	<div className="relative pt-[56.25%]">
		{result.processed_video_url.endsWith('.gif') ? (
			// For GIF files
			<img
				src={result.processed_video_url}
				className="absolute inset-0 w-full h-full rounded-lg object-contain"
				alt="Processed workout animation"
			/>
		) : (
			// For video files (fallback)
			<video 
				className="absolute inset-0 w-full h-full rounded-lg"
				controls
				autoPlay
				poster={result.thumbnail_url || ''}
			>
				<source src={result.processed_video_url} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		)}
	</div>
) : (
	<div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
		<p className="text-gray-500">No video available</p>
	</div>
)}
								</div>
								<p className="text-sm text-gray-500 mt-2">
									Mode: <span className="font-medium">{result.mode}</span>
								</p>
							</div>
							<div className="md:w-1/3 bg-antique rounded-lg p-4">
								<h3 className="font-semibold text-dark mb-3">Video Results</h3>
								
								<div className="space-y-4">
									<div>
										<p className="text-sm text-dark">Correct Squats</p>
										<p className="text-3xl font-bold text-emerald">{result.correct_squats}</p>
									</div>
									
									<div>
										<p className="text-sm text-dark">Incorrect Squats</p>
										<p className="text-3xl font-bold text-pastel">{result.incorrect_squats}</p>
									</div>
									
									<div>
										<p className="text-sm text-dark">Form Score</p>
										<p className="text-3xl font-bold text-emerald">
											{result.correct_squats + result.incorrect_squats === 0 
												? "-" 
												: `${Math.round((result.correct_squats / (result.correct_squats + result.incorrect_squats)) * 100)}%`}
										</p>
									</div>
								</div>
							</div>
						</div>
						
						<div className="text-center">
							<button
								onClick={resetUpload}
								className="px-6 py-2 bg-cosmic hover:bg-cosmic/80 rounded-lg transition-colors"
							>
								Analyze Another Video
							</button>
						</div>
					</div>
				)}
			</motion.div>
			
			{/* Stats component with overall stats */}
			<motion.div
				className="bg-white p-6 rounded-xl shadow-xl"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.4 }}
			>
				<SquatStats 
					stats={stats} 
					feedback={null} 
					previousWorkouts={previousWorkouts} 
					clearWorkoutHistory={clearWorkoutHistory}
				/>
			</motion.div>
			
			{/* Workout Summary box */}
			<motion.div 
				className="bg-white p-6 rounded-xl shadow-xl mt-8"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.4 }}
			>
				<h2 className="text-2xl font-semibold text-dark mb-4">Overall Summary</h2>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-emerald-light rounded-xl p-4 text-center">
						<h3 className="text-emerald-dark font-semibold mb-2">Total Videos</h3>
						<p className="text-3xl font-bold text-emerald">
							{previousWorkouts.filter(w => w.isVideo).length}
						</p>
						<p className="text-sm text-emerald-dark mt-1">analyzed</p>
					</div>
					
					<div className="bg-maximum-light rounded-xl p-4 text-center">
						<h3 className="text-maximum-dark font-semibold mb-2">Total Calories</h3>
						<p className="text-3xl font-bold text-maximum-dark">{stats.correct * 5}</p>
						<p className="text-sm text-maximum-dark mt-1">estimated</p>
					</div>
					
					<div className="bg-antique rounded-xl p-4 text-center">
						<h3 className="text-dark font-semibold mb-2">Overall Form</h3>
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
	)
}

export default VideoUpload