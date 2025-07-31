document.addEventListener('DOMContentLoaded', () => {
	const videoElement = document.getElementById('videoElement')
	const outputCanvas = document.getElementById('outputCanvas')
	const startButton = document.getElementById('startButton')
	const stopButton = document.getElementById('stopButton')
	const beginnerButton = document.getElementById('beginnerMode')
	const proButton = document.getElementById('proMode')
	const correctSquats = document.getElementById('correctSquats')
	const incorrectSquats = document.getElementById('incorrectSquats')
	const feedbackElement = document.getElementById('feedback')

	let stream = null
	let socket = null
	let isStreaming = false
	let currentMode = 'beginner'

	const ctx = outputCanvas.getContext('2d')

	const setupWebSocket = () => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		socket = new WebSocket(`${protocol}//${window.location.host}/ws`)

		socket.onopen = () => {
			console.log('WebSocket connected')
			if (currentMode === 'beginner') {
				socket.send('mode_beginner')
			} else {
				socket.send('mode_pro')
			}
		}

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data)

			if (data.mode_changed) {
				console.log(`Mode changed to ${data.mode_changed}`)
				return
			}

			if (data.image) {
				const img = new Image()
				img.onload = () => {
					outputCanvas.width = img.width
					outputCanvas.height = img.height
					ctx.drawImage(img, 0, 0)
				}
				img.src = data.image
			}

			if (data.squats_correct !== undefined) {
				correctSquats.textContent = data.squats_correct
			}

			if (data.squats_incorrect !== undefined) {
				incorrectSquats.textContent = data.squats_incorrect
			}

			if (data.feedback) {
				if (data.feedback === 'reset_counters') {
					feedbackElement.textContent = 'Counter reset due to inactivity'
					feedbackElement.className = 'p-3 bg-yellow-100 text-yellow-800 rounded'
				} else if (data.feedback === 'incorrect') {
					feedbackElement.textContent = 'Incorrect squat form detected'
					feedbackElement.className = 'p-3 bg-red-100 text-red-800 rounded'
				} else {
					feedbackElement.textContent = `Good job! You've completed ${data.feedback} correct squats`
					feedbackElement.className = 'p-3 bg-green-100 text-green-800 rounded'
				}
			}
		}

		socket.onclose = () => {
			console.log('WebSocket disconnected')
		}

		socket.onerror = (error) => {
			console.error('WebSocket error:', error)
		}
	}

	const startStreaming = async () => {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 640 },
					height: { ideal: 480 }
				},
				audio: false
			})
			videoElement.srcObject = stream
			setupWebSocket()

			outputCanvas.width = videoElement.clientWidth
			outputCanvas.height = videoElement.clientHeight

			startButton.disabled = true
			stopButton.disabled = false
			isStreaming = true

			const sendFrames = () => {
				if (!isStreaming || !socket || socket.readyState !== WebSocket.OPEN) return

				ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height)
				const imageData = outputCanvas.toDataURL('image/jpeg', 0.8)
				socket.send(imageData)

				setTimeout(sendFrames, 100) // Send ~10 frames per second
			}

			videoElement.onloadedmetadata = () => {
				outputCanvas.width = videoElement.videoWidth
				outputCanvas.height = videoElement.videoHeight
				sendFrames()
			}
		} catch (error) {
			console.error('Error accessing camera:', error)
			alert('Could not access the camera. Please check your permissions.')
		}
	}

	const stopStreaming = () => {
		if (stream) {
			stream.getTracks().forEach(track => track.stop())
			stream = null
		}

		if (socket) {
			socket.close()
			socket = null
		}

		isStreaming = false
		startButton.disabled = false
		stopButton.disabled = true
		ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
		feedbackElement.textContent = 'Start exercising to get feedback'
		feedbackElement.className = 'p-3 bg-gray-100 rounded'
	}

	startButton.addEventListener('click', startStreaming)
	stopButton.addEventListener('click', stopStreaming)

	beginnerButton.addEventListener('click', () => {
		currentMode = 'beginner'
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send('mode_beginner')
		}
		beginnerButton.classList.add('bg-blue-600')
		beginnerButton.classList.remove('bg-blue-500')
		proButton.classList.add('bg-purple-500')
		proButton.classList.remove('bg-purple-600')
	})

	proButton.addEventListener('click', () => {
		currentMode = 'pro'
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send('mode_pro')
		}
		proButton.classList.add('bg-purple-600')
		proButton.classList.remove('bg-purple-500')
		beginnerButton.classList.add('bg-blue-500')
		beginnerButton.classList.remove('bg-blue-600')
	})

	window.addEventListener('beforeunload', stopStreaming)
})