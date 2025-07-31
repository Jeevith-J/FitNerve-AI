import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from './Card'

export default function AIWorkoutPlanner({ userData }) {
	const [isGenerating, setIsGenerating] = useState(false)
	const [workoutPlan, setWorkoutPlan] = useState(null)
	const [error, setError] = useState(null)
	const [formData, setFormData] = useState({
		fitnessLevel: 'intermediate',
		fitnessGoal: 'build-muscle',
		workoutsPerWeek: 4,
		equipmentAccess: 'gym',
		duration: 45,
		focusAreas: [],
		injuries: ''
	})
	
	// Define focus areas options
	const focusAreasOptions = [
		{ id: 'chest', label: 'Chest' },
		{ id: 'back', label: 'Back' },
		{ id: 'shoulders', label: 'Shoulders' },
		{ id: 'arms', label: 'Arms' },
		{ id: 'legs', label: 'Legs' },
		{ id: 'abs', label: 'Core/Abs' },
		{ id: 'glutes', label: 'Glutes' },
		{ id: 'cardio', label: 'Cardio' }
	]
	
	// Load saved plan from localStorage on mount
	useEffect(() => {
		const savedPlan = localStorage.getItem('aiWorkoutPlan')
		if (savedPlan) {
			try {
				setWorkoutPlan(JSON.parse(savedPlan))
			} catch (error) {
				console.error('Error parsing saved workout plan:', error)
			}
		}
	}, [])
	
	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value, type } = e.target
		
		if (type === 'checkbox') {
			const checked = e.target.checked
			const checkboxId = e.target.id
			
			setFormData(prev => {
				const updatedFocusAreas = checked
					? [...prev.focusAreas, checkboxId]
					: prev.focusAreas.filter(area => area !== checkboxId)
				
				return {
					...prev,
					focusAreas: updatedFocusAreas
				}
			})
		} else {
			setFormData({
				...formData,
				[name]: name === 'workoutsPerWeek' || name === 'duration' 
					? parseInt(value) 
					: value
			})
		}
	}
	
	// Generate workout plan using Gemini API
	const generateWorkoutPlan = async () => {
		setIsGenerating(true)
		setError(null)
		
		try {
			// Create prompt for Gemini API
			const prompt = `Create a personalized workout plan with the following specifications:
				- Fitness level: ${formData.fitnessLevel}
				- Fitness goal: ${formData.fitnessGoal}
				- Workouts per week: ${formData.workoutsPerWeek} days
				- Equipment access: ${formData.equipmentAccess}
				- Workout duration: ${formData.duration} minutes
				- Focus areas: ${formData.focusAreas.length > 0 ? formData.focusAreas.join(', ') : 'balanced full body'}
				${formData.injuries ? '- Injuries/limitations to consider: ' + formData.injuries : ''}
				
				Provide a structured weekly workout plan with specific exercises, sets, reps, and rest periods.
				Format the response as JSON with the following structure:
				{
					"fitnessLevel": level name,
					"fitnessGoal": goal name,
					"workoutsPerWeek": number of days,
					"equipmentAccess": equipment type,
					"duration": duration in minutes,
					"focusAreas": [array of focus areas],
					"weeklySchedule": [
						{
							"day": day name (e.g., "Day 1", "Monday", etc.),
							"focus": workout focus (e.g., "Upper Body", "Legs", etc.),
							"exercises": [
								{
									"name": exercise name,
									"sets": number of sets,
									"reps": rep range (e.g., "8-12", "10"),
									"rest": rest period in seconds,
									"notes": optional notes on form or intensity
								},
								... (more exercises)
							]
						},
						... (more days)
					]
				}`;
				
			// Call the Gemini API via your backend endpoint
			const response = await fetch('/api/generate-ai-content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt }),
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate workout plan');
			}
			
			const data = await response.json();
			
			// Extract and parse the Gemini response
			let generatedPlanData;
			try {
				// First try direct parsing - Gemini might return JSON directly
				generatedPlanData = typeof data.content === 'object' 
					? data.content 
					: JSON.parse(data.content);
			} catch (err) {
				// If direct parsing fails, try to extract JSON from text
				const jsonMatch = data.content.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					generatedPlanData = JSON.parse(jsonMatch[0]);
				} else {
					throw new Error('Could not parse AI response as JSON');
				}
			}
			
			// Add timestamp to the plan
			const generatedPlan = {
				...generatedPlanData,
				generatedAt: new Date().toISOString()
			};
			
			setWorkoutPlan(generatedPlan);
			
			// Save to localStorage
			localStorage.setItem('aiWorkoutPlan', JSON.stringify(generatedPlan));
		} catch (error) {
			console.error('Error generating workout plan:', error);
			setError('Failed to generate workout plan. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};
	
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
	
	// Reset plan and start over
	const resetPlan = () => {
		if (confirm('Are you sure you want to start over with a new plan?')) {
			setWorkoutPlan(null)
			localStorage.removeItem('aiWorkoutPlan')
		}
	}
	
	return (
		<Card className="h-full overflow-visible">
			<div className="bg-dark text-white p-4">
				<h2 className="text-xl font-bold">AI Workout Planner</h2>
			</div>
			
			<div className="p-4">
				{!workoutPlan ? (
					<motion.div 
						className="space-y-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fitness Level
							</label>
							<select
								name="fitnessLevel"
								value={formData.fitnessLevel}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fitness Goal
							</label>
							<select
								name="fitnessGoal"
								value={formData.fitnessGoal}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="lose-weight">Lose Weight</option>
								<option value="build-muscle">Build Muscle</option>
								<option value="increase-strength">Increase Strength</option>
								<option value="improve-endurance">Improve Endurance</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Workouts Per Week
							</label>
							<select
								name="workoutsPerWeek"
								value={formData.workoutsPerWeek}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								{[2, 3, 4, 5, 6].map(num => (
									<option key={num} value={num}>{num} days</option>
								))}
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Equipment Access
							</label>
							<select
								name="equipmentAccess"
								value={formData.equipmentAccess}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="gym">Full Gym</option>
								<option value="home-basic">Home (Basic Equipment)</option>
								<option value="bodyweight">Bodyweight Only</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Workout Duration (minutes)
							</label>
							<select
								name="duration"
								value={formData.duration}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value={30}>30 minutes</option>
								<option value={45}>45 minutes</option>
								<option value={60}>60 minutes</option>
								<option value={90}>90 minutes</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Focus Areas (optional)
							</label>
							<div className="grid grid-cols-2 gap-2 mt-1">
								{focusAreasOptions.map(option => (
									<div key={option.id} className="flex items-center">
										<input
											type="checkbox"
											id={option.id}
											checked={formData.focusAreas.includes(option.id)}
											onChange={handleInputChange}
											className="h-4 w-4 text-emerald border-gray-300 rounded"
										/>
										<label htmlFor={option.id} className="ml-2 text-sm text-gray-700">
											{option.label}
										</label>
									</div>
								))}
							</div>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Injuries or Limitations (optional)
							</label>
							<input
								type="text"
								name="injuries"
								value={formData.injuries}
								onChange={handleInputChange}
								placeholder="E.g., lower back pain, shoulder injury"
								className="w-full p-2 border border-gray-300 rounded-md"
							/>
						</div>
						
						{error && (
							<div className="p-3 bg-pastel-light text-pastel-dark rounded-md text-sm">
								{error}
							</div>
						)}
						
						<motion.button
							className="w-full py-2 bg-emerald hover:bg-emerald-light text-white font-medium rounded-lg transition-colors"
							onClick={generateWorkoutPlan}
							disabled={isGenerating}
							whileHover={!isGenerating ? { scale: 1.01 } : {}}
							whileTap={!isGenerating ? { scale: 0.98 } : {}}
						>
							{isGenerating ? (
								<div className="flex items-center justify-center">
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Generating Workout Plan...
								</div>
							) : 'Generate Workout Plan with AI'}
						</motion.button>
					</motion.div>
				) : (
					<motion.div 
						className="space-y-5"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<div className="bg-cosmic p-4 rounded-lg">
							<div className="text-center mb-2">
								<div className="text-gray-500 mb-1">Personalized Workout Plan</div>
								<div className="text-xl font-bold text-emerald">
									{workoutPlan.workoutsPerWeek}x Per Week • {workoutPlan.duration} min
								</div>
								<div className="text-xs text-gray-500">
									{workoutPlan.fitnessLevel} • {workoutPlan.fitnessGoal.replace('-', ' ')}
								</div>
								{workoutPlan.generatedAt && (
									<div className="text-xs text-gray-400 mt-1">
										Generated: {formatDate(workoutPlan.generatedAt)}
									</div>
								)}
							</div>
							
							<div className="grid grid-cols-2 gap-3 mt-4">
								<div className="bg-white p-3 rounded-lg shadow-sm">
									<div className="text-sm text-gray-500">Equipment</div>
									<div className="font-semibold text-lg capitalize">
										{workoutPlan.equipmentAccess.replace('-', ' ')}
									</div>
								</div>
								<div className="bg-white p-3 rounded-lg shadow-sm">
									<div className="text-sm text-gray-500">Focus</div>
									<div className="font-semibold text-lg">
										{workoutPlan.focusAreas.length > 0 
											? workoutPlan.focusAreas.map(area => 
												area.charAt(0).toUpperCase() + area.slice(1)
											).join(', ')
											: 'Full Body'
										}
									</div>
								</div>
							</div>
						</div>
						
						<div className="space-y-3">
							{workoutPlan.weeklySchedule.map((day, index) => (
								<WorkoutDayCard key={index} day={day} />
							))}
						</div>
						
						<div className="pt-4 border-t border-gray-200">
							<motion.button
								className="w-full py-2 bg-maximum hover:bg-maximum-light text-dark font-medium rounded-lg transition-colors"
								onClick={resetPlan}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.98 }}
							>
								Generate New Plan
							</motion.button>
						</div>
					</motion.div>
				)}
			</div>
		</Card>
	)
}

// Workout Day Card Component
function WorkoutDayCard({ day }) {
	const [expanded, setExpanded] = useState(false)
	
	return (
		<motion.div 
			className="bg-white rounded-lg shadow-sm overflow-hidden"
			initial={false}
			animate={{ height: expanded ? 'auto' : '80px' }}
		>
			<div 
				className="p-4 cursor-pointer"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex justify-between items-center">
					<div>
						<div className="text-base font-medium">{day.day}</div>
						<div className="text-sm text-gray-500">{day.focus}</div>
					</div>
					<div className="flex items-center">
						<div className="text-gray-500 mr-2">{day.exercises.length} exercises</div>
						<motion.div
							initial={false}
							animate={{ rotate: expanded ? 180 : 0 }}
							transition={{ duration: 0.3 }}
						>
							<svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</motion.div>
					</div>
				</div>
			</div>
			
			{expanded && (
				<div className="px-4 pb-4">
					<div className="border-t border-gray-200 pt-2">
						{day.exercises.map((exercise, idx) => (
							<div key={idx} className="py-3 border-b border-gray-100 last:border-0">
								<div className="flex justify-between">
									<div className="font-medium">{exercise.name}</div>
									<div className="text-sm text-gray-600">
										{exercise.sets} sets × {exercise.reps} reps
									</div>
								</div>
								<div className="mt-1 text-xs text-gray-500 flex justify-between">
									<div>Rest: {exercise.rest}s</div>
									{exercise.notes && <div className="italic">{exercise.notes}</div>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</motion.div>
	)
}