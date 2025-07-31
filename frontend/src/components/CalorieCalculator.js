import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from './Card'
import ProgressBar from './ProgressBar'
import { SAMPLE_DATA, ANIMATIONS } from '@/constants'

export default function CalorieCalculator({ userData = SAMPLE_DATA, initialState = {}, onStateChange = () => {} }) {
	const [activeTab, setActiveTab] = useState(initialState.activeTab || 'calculator')
	const [formData, setFormData] = useState({
		age: 30,
		gender: 'male',
		weight: 75,
		height: 175,
		activityLevel: 'moderately active',
		goal: 'maintenance'
	})
	const [results, setResults] = useState(null)
	const [savedResults, setSavedResults] = useState([])
	const [formErrors, setFormErrors] = useState({})
	
	useEffect(() => {
		onStateChange({
			...initialState,
			activeTab
		})
	}, [activeTab])
	
	// Load user data from localStorage and update form data
	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			const user = JSON.parse(storedUser)
			
			// Update form with user data if available
			setFormData(prevData => ({
				...prevData,
				age: user.age || prevData.age,
				gender: user.gender || prevData.gender,
				weight: user.weight || prevData.weight,
				height: user.height || prevData.height,
				// Keep existing activity level and goal
			}))
		}
	}, [])
	
	// Load saved results from localStorage
	useEffect(() => {
		const storedResults = localStorage.getItem('calorieResults')
		if (storedResults) {
			const parsedResults = JSON.parse(storedResults)
			setSavedResults(parsedResults)
			
			// Set the most recent result as current
			if (parsedResults.length > 0) {
				setResults(parsedResults[0])
				setActiveTab('results')
			}
		}
	}, [])

	// Save results to localStorage when they change
	useEffect(() => {
		if (savedResults.length > 0) {
			localStorage.setItem('calorieResults', JSON.stringify(savedResults))
		}
	}, [savedResults])

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
		
		// Clear error when field is updated
		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: undefined
			})
		}
	}

	const validateForm = () => {
		const errors = {}
		
		if (!formData.age || formData.age < 15 || formData.age > 100) {
			errors.age = 'Age must be between 15 and 100'
		}
		
		if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
			errors.weight = 'Weight must be between 30 and 300 kg'
		}
		
		if (!formData.height || formData.height < 100 || formData.height > 250) {
			errors.height = 'Height must be between 100 and 250 cm'
		}
		
		setFormErrors(errors)
		return Object.keys(errors).length === 0
	}

	const calculateResults = () => {
		if (!validateForm()) {
			return
		}
		
		// BMR using the Mifflin-St Jeor Equation
		let bmr
		if (formData.gender === 'male') {
			bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5
		} else {
			bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age - 161
		}

		// TDEE calculation
		const activityMultipliers = {
			'sedentary': 1.2,
			'lightly active': 1.375,
			'moderately active': 1.55,
			'very active': 1.725
		}
		const tdee = bmr * activityMultipliers[formData.activityLevel]

		// Adjust based on goal
		let goalCalories = tdee
		let adjustmentPercentage = 0
		
		if (formData.goal === 'weight loss') {
			goalCalories = tdee - 500
			adjustmentPercentage = -15
		} else if (formData.goal === 'muscle gain') {
			goalCalories = tdee + 300
			adjustmentPercentage = 10
		}

		// Macronutrients
		const proteinMin = formData.weight * 1.6
		const proteinMax = formData.weight * 2.2
		const fats = (goalCalories * 0.25) / 9 // 25% of calories from fat (9 cal/g)
		const carbs = (goalCalories * 0.45) / 4 // 45% of calories from carbs (4 cal/g)
		const fiber = (goalCalories * 0.015) / 2 // approximate 15 cal/1000 cal, divided by 2 cal/g

		const newResults = {
			date: new Date().toISOString(),
			formData: { ...formData },
			bmr: Math.round(bmr),
			tdee: Math.round(tdee),
			goalCalories: Math.round(goalCalories),
			proteinMin: Math.round(proteinMin),
			proteinMax: Math.round(proteinMax),
			fats: Math.round(fats),
			carbs: Math.round(carbs),
			fiber: Math.round(fiber),
			adjustmentPercentage
		}
		
		setResults(newResults)
		setSavedResults([newResults, ...savedResults.slice(0, 4)]) // Keep last 5 results
		setActiveTab('results')
	}
	
	// Format date for display
	const formatDate = (dateString) => {
		if (!dateString) return 'Today'
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const activityLevelOptions = [
		{ value: 'sedentary', label: 'Sedentary (office job, little exercise)' },
		{ value: 'lightly active', label: 'Lightly Active (1-2 days/week)' },
		{ value: 'moderately active', label: 'Moderately Active (3-5 days/week)' },
		{ value: 'very active', label: 'Very Active (6-7 days/week)' }
	]

	const goalOptions = [
		{ value: 'weight loss', label: 'Weight Loss' },
		{ value: 'maintenance', label: 'Maintenance' },
		{ value: 'muscle gain', label: 'Muscle Gain' }
	]

	// Reset to calculator mode and prepare for recalculation
	const handleRecalculate = () => {
		setActiveTab('calculator')
	}

	return (
		<Card className="overflow-visible">
			<div className="bg-dark text-white p-4">
				<h2 className="text-xl font-bold">Calorie Calculator</h2>
			</div>
			
			<div className="p-4">
				{/* Tab Navigation */}
				<div className="flex mb-6">
					<TabButton
						isActive={activeTab === 'calculator'}
						onClick={() => setActiveTab('calculator')}
						label="Calculator"
					/>
					<TabButton
						isActive={activeTab === 'results' && results}
						onClick={() => results && setActiveTab('results')}
						label="Results"
					/>
					<TabButton
						isActive={activeTab === 'tips'}
						onClick={() => setActiveTab('tips')}
						label="Nutrition Tips"
					/>
				</div>
				
				{/* Calculator Form */}
				{activeTab === 'calculator' && (
					<motion.div 
						className="space-y-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<FormField
							label="Age"
							name="age"
							type="number"
							value={formData.age}
							onChange={handleInputChange}
							error={formErrors.age}
							width="half"
							siblingField={
								<FormField
									label="Gender"
									name="gender"
									type="select"
									value={formData.gender}
									onChange={handleInputChange}
									options={[
										{ value: 'male', label: 'Male' },
										{ value: 'female', label: 'Female' }
									]}
									width="half"
								/>
							}
						/>
						
						<FormField
							label="Weight (kg)"
							name="weight"
							type="number"
							value={formData.weight}
							onChange={handleInputChange}
							error={formErrors.weight}
							width="half"
							siblingField={
								<FormField
									label="Height (cm)"
									name="height"
									type="number"
									value={formData.height}
									onChange={handleInputChange}
									error={formErrors.height}
									width="half"
								/>
							}
						/>
						
						<FormField
							label="Activity Level"
							name="activityLevel"
							type="select"
							value={formData.activityLevel}
							onChange={handleInputChange}
							options={activityLevelOptions}
						/>
						
						<FormField
							label="Goal"
							name="goal"
							type="select"
							value={formData.goal}
							onChange={handleInputChange}
							options={goalOptions}
						/>

						<motion.button
							className="w-full py-2 bg-emerald hover:bg-emerald-light text-white font-medium rounded-lg transition-colors"
							onClick={calculateResults}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.98 }}
						>
							Calculate
						</motion.button>
					</motion.div>
				)}
				
				{/* Results Tab */}
				{activeTab === 'results' && results && (
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<ResultsCard 
							results={results}
							formatDate={formatDate}
						/>
						
						<MacroBreakdown results={results} />
						
						{savedResults.length > 1 && (
							<HistorySection 
								savedResults={savedResults}
								setResults={setResults}
								setFormData={setFormData}
								formatDate={formatDate}
							/>
						)}
						
						<div className="pt-4 border-t border-gray-200">
							<motion.button
								className="w-full py-2 bg-maximum hover:bg-maximum-light text-dark font-medium rounded-lg transition-colors"
								onClick={handleRecalculate}
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.98 }}
							>
								Recalculate
							</motion.button>
						</div>
					</motion.div>
				)}
				
				{/* Nutrition Tips Tab */}
				{activeTab === 'tips' && (
					<NutritionTips />
				)}
			</div>
		</Card>
	)
}

// Form field component with error handling and flexible layout
function FormField({ label, name, type, value, onChange, error, options, width = 'full', siblingField }) {
	const fieldClass = width === 'half' ? 'w-1/2' : 'w-full'
	
	return (
		<div className={`${siblingField ? 'flex gap-4' : ''}`}>
			<div className={`${siblingField ? fieldClass : 'w-full'}`}>
				<label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
				{type === 'select' ? (
					<select
						name={name}
						value={value}
						onChange={onChange}
						className={`w-full p-2 border ${error ? 'border-pastel' : 'border-gray-300'} rounded-md`}
					>
						{options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				) : (
					<input
						type={type}
						name={name}
						value={value}
						onChange={onChange}
						className={`w-full p-2 border ${error ? 'border-pastel' : 'border-gray-300'} rounded-md`}
					/>
				)}
				{error && (
					<p className="text-xs text-pastel mt-1">{error}</p>
				)}
			</div>
			{siblingField}
		</div>
	)
}

// Results card component
function ResultsCard({ results, formatDate }) {
	if (!results) return null
	
	return (
		<div className="bg-cosmic p-4 rounded-lg">
			<div className="text-center mb-4">
				<div className="text-gray-500 mb-1">Recommended Daily Calories</div>
				<div className="text-4xl font-bold text-emerald">{results.goalCalories}</div>
				<div className="text-sm text-gray-500 mt-1">
					{results.adjustmentPercentage > 0 
						? `+${results.adjustmentPercentage}% surplus` 
						: results.adjustmentPercentage < 0 
							? `${results.adjustmentPercentage}% deficit` 
							: 'maintenance'}
				</div>
				{results.date && (
					<div className="text-xs text-gray-400 mt-2">
						Calculated: {formatDate(results.date)}
					</div>
				)}
			</div>
			
			<div className="grid grid-cols-2 gap-4 mt-6">
				<div className="bg-white p-3 rounded-lg shadow-sm">
					<div className="text-sm text-gray-500">BMR</div>
					<div className="font-semibold text-lg">{results.bmr} kcal</div>
				</div>
				<div className="bg-white p-3 rounded-lg shadow-sm">
					<div className="text-sm text-gray-500">TDEE</div>
					<div className="font-semibold text-lg">{results.tdee} kcal</div>
				</div>
			</div>
		</div>
	)
}

// Macronutrient breakdown component
function MacroBreakdown({ results }) {
	if (!results) return null
	
	return (
		<div>
			<h3 className="text-lg font-semibold mb-3">Macronutrient Breakdown</h3>
			
			<div className="space-y-4">
				<MacroNutrient 
					name="Protein" 
					amount={`${results.proteinMin}-${results.proteinMax}g`} 
					percentage={25} 
					color="bg-emerald" 
				/>
				
				<MacroNutrient 
					name="Carbs" 
					amount={`${results.carbs}g`} 
					percentage={45} 
					color="bg-maximum" 
				/>
				
				<MacroNutrient 
					name="Fats" 
					amount={`${results.fats}g`} 
					percentage={30} 
					color="bg-pastel" 
				/>
				
				<div className="flex justify-between items-center mt-2">
					<div className="text-sm text-gray-600">Fiber</div>
					<div className="text-sm font-medium">{results.fiber}g</div>
				</div>
			</div>
		</div>
	)
}

// Individual macronutrient bar
function MacroNutrient({ name, amount, percentage, color }) {
	return (
		<div>
			<div className="flex justify-between mb-1">
				<div className="text-sm text-gray-600">{name}</div>
				<div className="text-sm font-medium">{amount}</div>
			</div>
			<ProgressBar percentage={percentage} height={2} color={color} />
			<div className="text-right text-xs text-gray-500 mt-1">{percentage}% of calories</div>
		</div>
	)
}

// History section component
function HistorySection({ savedResults, setResults, setFormData, formatDate }) {
	return (
		<div>
			<h3 className="text-lg font-semibold mb-3">Calculation History</h3>
			<div className="bg-cosmic p-3 rounded-lg overflow-x-auto">
				<div className="w-full min-w-max">
					<div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 mb-2">
						<div>Date</div>
						<div>Goal</div>
						<div>Weight</div>
						<div>Calories</div>
					</div>
					
					{savedResults.slice(1).map((result, index) => (
						<div 
							key={index}
							className="grid grid-cols-4 gap-2 text-sm py-2 border-t border-gray-200 cursor-pointer hover:bg-antique"
							onClick={() => {
								setResults(result)
								setFormData(result.formData || {})
							}}
						>
							<div>{formatDate(result.date)}</div>
							<div>{result.formData?.goal || 'N/A'}</div>
							<div>{result.formData?.weight || '-'} kg</div>
							<div className="font-medium">{result.goalCalories}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

// Nutrition tips tab
function NutritionTips() {
	const tips = [
		{
			title: 'Protein Intake Tips',
			items: [
				'Aim for 1.6-2.2g of protein per kg of bodyweight',
				'Distribute protein intake evenly throughout the day',
				'Include protein in every meal',
				'Consider protein supplements if struggling to meet needs'
			]
		},
		{
			title: 'Meal Timing',
			items: [
				'Eat a meal 1-3 hours before workout',
				'Consume protein within 2 hours after workout',
				'Space meals 3-4 hours apart when possible',
				'Consider intermittent fasting if it fits your schedule'
			]
		},
		{
			title: 'Hydration',
			items: [
				'Drink at least 3-4 liters of water daily',
				'Increase water intake during hot weather or intense workouts',
				'Monitor urine color (pale yellow indicates good hydration)'
			]
		}
	]
	
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="space-y-4"
		>
			{tips.map((section, index) => (
				<div key={index} className="bg-cosmic p-4 rounded-lg">
					<h3 className="font-medium mb-2">{section.title}</h3>
					<ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
						{section.items.map((item, i) => (
							<li key={i}>{item}</li>
						))}
					</ul>
				</div>
			))}
		</motion.div>
	)
}

// Tab button component
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