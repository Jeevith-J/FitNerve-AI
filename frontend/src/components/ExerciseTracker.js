import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from './Card'
import ProgressBar from './ProgressBar'
import { SAMPLE_DATA, ANIMATIONS } from '@/constants'

export default function ExerciseTracker({ exerciseData = SAMPLE_DATA, initialState = {}, onStateChange = () => {} }) {
	const [activeTab, setActiveTab] = useState(initialState.activeTab || 'strength')
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null)
	const [selectedExercise, setSelectedExercise] = useState(null)
	const [selectedCardio, setSelectedCardio] = useState(null)
	const [logs, setLogs] = useState([])
	const [form, setForm] = useState({
		// Strength form
		sets: 3,
		reps: 10,
		weight: 50,
		duration: 15,
		// Cardio form
		speed: 8,
		incline: 1
	})
	useEffect(() => {
		onStateChange({
			...initialState,
			activeTab
		})
	}, [activeTab])

	// Load logs from localStorage on component mount
	useEffect(() => {
		const storedLogs = localStorage.getItem('exerciseLogs')
		if (storedLogs) {
			setLogs(JSON.parse(storedLogs))
		}
	}, [])
	
	// Save logs to localStorage when they change
	useEffect(() => {
		if (logs.length > 0) {
			localStorage.setItem('exerciseLogs', JSON.stringify(logs))
		}
	}, [logs])
	
	const muscleGroups = [
		{ name: 'Chest', icon: '💪', exercises: ['Bench Press', 'Incline Press', 'Dumbbell Flyes', 'Push-Ups'] },
		{ name: 'Back', icon: '🔙', exercises: ['Pull-Ups', 'Deadlifts', 'Rows', 'Lat Pulldowns'] },
		{ name: 'Shoulders', icon: '🏋️', exercises: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Shrugs'] },
		{ name: 'Arms', icon: '💪', exercises: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers'] },
		{ name: 'Legs', icon: '🦵', exercises: ['Squats', 'Lunges', 'Leg Press', 'Hamstring Curls'] },
		{ name: 'Core', icon: '🔄', exercises: ['Crunches', 'Planks', 'Leg Raises', 'Russian Twists'] }
	]
	
	const cardioOptions = [
		{ name: 'Treadmill', calories: 10.5, icon: '🏃' }, // calories per minute
		{ name: 'Cycling', calories: 9.5, icon: '🚴' },
		{ name: 'Elliptical', calories: 8.0, icon: '⭕' },
		{ name: 'Rowing', calories: 10.0, icon: '🚣' },
		{ name: 'Stairmaster', calories: 10.3, icon: '🪜' },
		{ name: 'Jump Rope', calories: 11.7, icon: '⏱️' }
	]
	
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setForm({
			...form,
			[name]: parseFloat(value) || 0
		})
	}
	
	// Calculate calories for strength training
	const calculateStrengthCalories = (exercise, duration) => {
		const baseRates = {
			bench: 7.5, press: 7.5, 
			deadlift: 8, row: 8, pull: 8,
			shoulder: 6, raise: 6,
			curl: 5.5, extension: 5.5,
			squat: 7, leg: 7, lunge: 7,
			crunch: 5.5, plank: 5.5, twist: 5.5
		}
		
		const name = exercise.toLowerCase()
		let caloriesPerMin = 5 // default
		
		Object.entries(baseRates).forEach(([key, rate]) => {
			if (name.includes(key)) caloriesPerMin = rate
		})
		
		return Math.round(caloriesPerMin * duration)
	}
	
	// Calculate calories for cardio
	const calculateCardioCalories = (exercise, duration, speed = 0, incline = 0) => {
		const option = cardioOptions.find(opt => opt.name === exercise)
		let calories = option ? option.calories * duration : 9 * duration
		
		// Adjust based on speed and incline for treadmill
		if (exercise === 'Treadmill' && speed && incline) {
			const speedFactor = speed / 8 // normalize with 8 km/h as baseline
			const inclineFactor = 1 + (incline / 10) // 10% incline increases by 100%
			calories = calories * speedFactor * inclineFactor
		}
		
		return Math.round(calories)
	}
	
	const handleLogStrengthExercise = () => {
		const calories = calculateStrengthCalories(selectedExercise, form.duration)
		
		const newLog = {
			id: Date.now(),
			date: new Date().toISOString(),
			type: 'strength',
			muscleGroup: selectedMuscleGroup,
			exercise: selectedExercise,
			sets: form.sets,
			reps: form.reps,
			weight: form.weight,
			duration: form.duration,
			calories
		}
		
		setLogs([newLog, ...logs])
		setSelectedExercise(null)
	}
	
	const handleLogCardio = () => {
		const calories = calculateCardioCalories(
			selectedCardio,
			form.duration,
			form.speed,
			form.incline
		)
		
		const newLog = {
			id: Date.now(),
			date: new Date().toISOString(),
			type: 'cardio',
			exercise: selectedCardio,
			duration: form.duration,
			speed: form.speed,
			incline: form.incline,
			calories
		}
		
		setLogs([newLog, ...logs])
		setSelectedCardio(null)
	}
	
	// Calculate total calories for the week
	const calculateTotalCalories = () => {
		const now = new Date()
		const oneWeekAgo = new Date(now.setDate(now.getDate() - 7))
		
		return logs
			.filter(log => new Date(log.date) >= oneWeekAgo)
			.reduce((total, log) => total + log.calories, 0)
	}
	
	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}
	
	// Clear all logs
	const clearLogs = () => {
		if (confirm('Are you sure you want to clear all exercise logs?')) {
			setLogs([])
			localStorage.removeItem('exerciseLogs')
		}
	}
	
	return (
		<Card className="overflow-visible">
			<div className="bg-dark text-white p-4">
				<h2 className="text-xl font-bold">Exercise Tracker</h2>
			</div>
			
			<div className="p-4">
				{/* Tab Navigation */}
				<div className="flex mb-6">
					<TabButton
						isActive={activeTab === 'strength'}
						onClick={() => {
							setActiveTab('strength')
							setSelectedExercise(null)
							setSelectedCardio(null)
						}}
						label="Strength Training"
					/>
					<TabButton
						isActive={activeTab === 'cardio'}
						onClick={() => {
							setActiveTab('cardio')
							setSelectedExercise(null)
							setSelectedCardio(null)
						}}
						label="Cardio"
					/>
					<TabButton
						isActive={activeTab === 'progress'}
						onClick={() => setActiveTab('progress')}
						label="Progress"
					/>
				</div>
				
				{/* Strength Training Tab */}
				{activeTab === 'strength' && !selectedExercise && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Choose a muscle group</h3>
						
						<div className="grid grid-cols-3 gap-3">
							{muscleGroups.map((group) => (
								<motion.div
									key={group.name}
									className={`p-3 rounded-lg cursor-pointer transition-colors ${
										selectedMuscleGroup === group.name 
											? 'bg-emerald text-white' 
											: 'bg-cosmic hover:bg-antique'
									}`}
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => setSelectedMuscleGroup(group.name)}
								>
									<div className="text-center">
										<div className="text-2xl mb-1">{group.icon}</div>
										<div className="font-medium">{group.name}</div>
									</div>
								</motion.div>
							))}
						</div>
						
						{selectedMuscleGroup && (
							<motion.div 
								className="mt-6"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								transition={{ duration: 0.3 }}
							>
								<h3 className="text-lg font-semibold mb-3">
									{selectedMuscleGroup} exercises
								</h3>
								
								<div className="bg-cosmic p-4 rounded-lg">
									{muscleGroups
										.find(group => group.name === selectedMuscleGroup)
										?.exercises.map(exercise => (
											<div key={exercise} className="flex justify-between mb-4 last:mb-0">
												<div className="font-medium">{exercise}</div>
												<button 
													className="text-emerald hover:text-emerald-light"
													onClick={() => setSelectedExercise(exercise)}
												>
													Log
												</button>
											</div>
										))
									}
								</div>
							</motion.div>
						)}
					</div>
				)}
				
				{/* Exercise Form */}
				{activeTab === 'strength' && selectedExercise && (
					<FormPanel
						title={`Log ${selectedExercise}`}
						onCancel={() => setSelectedExercise(null)}
						onSubmit={handleLogStrengthExercise}
						submitText="Log Exercise"
						formElements={[
							{ name: 'sets', label: 'Sets', type: 'number', value: form.sets },
							{ name: 'reps', label: 'Reps', type: 'number', value: form.reps },
							{ name: 'weight', label: 'Weight (kg)', type: 'number', value: form.weight },
							{ name: 'duration', label: 'Duration (minutes)', type: 'number', value: form.duration }
						]}
						onChange={handleInputChange}
						info={{
							label: 'Estimated Calories',
							value: calculateStrengthCalories(selectedExercise, form.duration)
						}}
					/>
				)}
				
				{/* Cardio Tab */}
				{activeTab === 'cardio' && !selectedCardio && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold mb-4">Log cardio activity</h3>
						
						<div className="grid grid-cols-2 gap-3 mb-6">
							{cardioOptions.map((option) => (
								<motion.div
									key={option.name}
									className="bg-cosmic p-4 rounded-lg hover:bg-antique cursor-pointer"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => setSelectedCardio(option.name)}
								>
									<div className="flex items-center space-x-3">
										<div className="text-2xl">{option.icon}</div>
										<div>
											<div className="font-medium">{option.name}</div>
											<div className="text-sm text-gray-500">
												~{Math.round(option.calories * 30)} cal/30min
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				)}
				
				{/* Cardio Form */}
				{activeTab === 'cardio' && selectedCardio && (
					<FormPanel
						title={`Log ${selectedCardio}`}
						onCancel={() => setSelectedCardio(null)}
						onSubmit={handleLogCardio}
						submitText="Log Cardio"
						formElements={[
							{ name: 'duration', label: 'Duration (minutes)', type: 'number', value: form.duration },
							...(selectedCardio === 'Treadmill' ? [
								{ name: 'speed', label: 'Speed (km/h)', type: 'number', value: form.speed },
								{ name: 'incline', label: 'Incline (%)', type: 'number', value: form.incline }
							] : [])
						]}
						onChange={handleInputChange}
						info={{
							label: 'Estimated Calories',
							value: calculateCardioCalories(
								selectedCardio,
								form.duration,
								form.speed,
								form.incline
							)
						}}
					/>
				)}
				
				{/* Progress Tab */}
				{activeTab === 'progress' && (
					<div className="space-y-4">
						<div className="bg-cosmic p-4 rounded-lg">
							<h3 className="font-medium mb-3">Recent Activities</h3>
							
							{logs.length === 0 ? (
								<div className="text-center py-4 text-gray-500">
									No activities logged yet
								</div>
							) : (
								<div className="space-y-3">
									{logs.slice(0, 5).map(log => (
										<div key={log.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
											<div>
												<div className="font-medium">{log.exercise}</div>
												{log.type === 'strength' ? (
													<div className="text-sm text-gray-500">
														{log.sets} sets × {log.reps} reps × {log.weight}kg
													</div>
												) : (
													<div className="text-sm text-gray-500">
														{log.duration} min
														{log.speed ? ` at ${log.speed} km/h` : ''}
														{log.incline ? `, ${log.incline}% incline` : ''}
													</div>
												)}
												<div className="text-xs text-gray-400">{formatDate(log.date)}</div>
											</div>
											<div className="text-emerald font-medium">{log.calories} cal</div>
										</div>
									))}
								</div>
							)}
						</div>
						
						<div className="bg-cosmic p-4 rounded-lg">
							<h3 className="font-medium mb-2">Weekly Breakdown</h3>
							<div className="flex items-center justify-between mt-2">
								<div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
									<motion.div 
										className="bg-emerald h-4"
										initial={{ width: 0 }}
										animate={{ width: `${Math.min((calculateTotalCalories() / 3000) * 100, 100)}%` }}
										transition={{ duration: 1, ease: "easeOut" }}
									></motion.div>
								</div>
								<span className="ml-3 font-medium text-emerald">
									{Math.round((calculateTotalCalories() / 3000) * 100)}%
								</span>
							</div>
							<div className="flex justify-between mt-2 text-xs text-gray-500">
								<span>{calculateTotalCalories()} kcal</span>
								<span>Goal: 3000 kcal</span>
							</div>
						</div>
						
						{logs.length > 0 && (
							<div className="text-center pt-2">
								<button
									className="text-pastel hover:text-pastel-light font-medium"
									onClick={clearLogs}
								>
									Clear All Logs
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</Card>
	)
}

function TabButton({ isActive, onClick, label }) {
	return (
		<motion.button
			onClick={onClick}
			className={`relative flex-1 px-4 py-2 text-center font-medium ${
				isActive ? 'text-emerald' : 'text-gray-500 hover:text-emerald'
			}`}
			whileTap={{ scale: 0.97 }}
		>
			{label}
			{isActive && (
				<motion.div
					className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald"
					layoutId="tabIndicator"
					transition={{ type: "spring", duration: 0.5 }}
				/>
			)}
		</motion.button>
	)
}

function FormPanel({ title, onCancel, onSubmit, submitText, formElements, onChange, info }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-4"
		>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">{title}</h3>
				<button 
					className="text-gray-500"
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
			
			<div className="bg-cosmic p-4 rounded-lg space-y-4">
				{formElements.map(element => (
					<div key={element.name}>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{element.label}
						</label>
						<input
							type={element.type}
							name={element.name}
							value={element.value}
							onChange={onChange}
							className="w-full p-2 border border-gray-300 rounded-md"
						/>
					</div>
				))}
				
				{info && (
					<div className="p-4 rounded-lg bg-antique text-center">
						<div className="text-sm text-gray-600">{info.label}</div>
						<div className="text-2xl font-bold text-emerald">
							{info.value}
						</div>
					</div>
				)}
				
				<div className="pt-2">
					<motion.button
						className="w-full py-2 bg-emerald hover:bg-emerald-light text-white font-medium rounded-lg transition-colors"
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.98 }}
						onClick={onSubmit}
					>
						{submitText}
					</motion.button>
				</div>
			</div>
		</motion.div>
	)
}