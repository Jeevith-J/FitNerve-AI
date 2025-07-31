import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'

const NutritionTracker = forwardRef((props, ref) => {
	const [nutrition, setNutrition] = useState({
		calories: 0,
		protein: 0,
		carbs: 0,
		fats: 0,
		fiber: 0
	})
	
	const [savedFoods, setSavedFoods] = useState([])
	const [calorieGoal, setCalorieGoal] = useState(2000)
	const [showGoalEditor, setShowGoalEditor] = useState(false)
	const [tempGoal, setTempGoal] = useState(2000)
	
	// Load nutrition data from localStorage on component mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedNutrition = localStorage.getItem('nutrition')
			if (savedNutrition) {
				setNutrition(JSON.parse(savedNutrition))
			}
			
			const foods = localStorage.getItem('savedFoods')
			if (foods) {
				setSavedFoods(JSON.parse(foods))
			}
			
			const goal = localStorage.getItem('calorieResults')
			if (goal) {
				const parsedGoal = JSON.parse(goal)
				console.log(parsedGoal?.at(-1))
				setCalorieGoal(parseInt(parsedGoal?.at(-1)?.goalCalories))
				setTempGoal(parseInt(goal))
			}
		}
	}, [])
	
	// Save nutrition data to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('nutrition', JSON.stringify(nutrition))
			localStorage.setItem('savedFoods', JSON.stringify(savedFoods))
			localStorage.setItem('calorieGoal', calorieGoal.toString())
		}
	}, [nutrition, savedFoods, calorieGoal])
	
	const addFood = (food) => {
		console.log('Adding food:', food)
		const newNutrition = {
			calories: nutrition.calories + parseInt(food.calories || 0),
			protein: nutrition.protein + parseInt(food.protein || 0),
			carbs: nutrition.carbs + parseInt(food.carbs || 0),
			fats: nutrition.fats + parseInt(food.fats || 0),
			fiber: nutrition.fiber + parseInt(food.fiber || 0)
		}
		
		setNutrition(newNutrition)
		
		const now = new Date()
		const newFood = {
			...food,
			id: Date.now(),
			addedAt: now.toISOString()
		}
		
		setSavedFoods(prev => [newFood, ...prev].slice(0, 10)) // Keep only last 10 items
	}
	
	// Expose the addFood method to parent components
	useImperativeHandle(ref, () => ({
		addFood
	}))
	
	const removeFood = (id) => {
		const foodToRemove = savedFoods.find(food => food.id === id)
		if (!foodToRemove) return
		
		setNutrition(prev => ({
			calories: Math.max(0, prev.calories - parseInt(foodToRemove.calories || 0)),
			protein: Math.max(0, prev.protein - parseInt(foodToRemove.protein || 0)),
			carbs: Math.max(0, prev.carbs - parseInt(foodToRemove.carbs || 0)),
			fats: Math.max(0, prev.fats - parseInt(foodToRemove.fats || 0)),
			fiber: Math.max(0, prev.fiber - parseInt(foodToRemove.fiber || 0))
		}))
		
		setSavedFoods(prev => prev.filter(food => food.id !== id))
	}
	
	const resetNutrition = () => {
		if (window.confirm('Are you sure you want to reset your nutrition tracker? This will clear all food entries for today.')) {
			setNutrition({
				calories: 0,
				protein: 0,
				carbs: 0,
				fats: 0,
				fiber: 0
			})
			setSavedFoods([])
		}
	}
	
	const saveCalorieGoal = () => {
		setCalorieGoal(tempGoal)
		setShowGoalEditor(false)
	}
	
	const calculatePercentage = (value) => {
		if (!value) return 0
		
		switch(value) {
			case 'protein':
				return Math.min(100, Math.round((nutrition.protein * 4 / calorieGoal) * 100))
			case 'carbs':
				return Math.min(100, Math.round((nutrition.carbs * 4 / calorieGoal) * 100))
			case 'fats':
				return Math.min(100, Math.round((nutrition.fats * 9 / calorieGoal) * 100))
			case 'fiber':
				return Math.min(100, nutrition.fiber * 4)
			case 'calories':
				return Math.min(100, Math.round((nutrition.calories / calorieGoal) * 100))
			default:
				return 0
		}
	}
	
	const formatTime = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	}
	
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				delayChildren: 0.2,
				staggerChildren: 0.1
			}
		}
	}
	
	return (
		<motion.div 
			className="bg-white rounded-2xl shadow-xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ 
				duration: 0.5,
				type: "spring",
				stiffness: 100
			}}
		>
			<div className="p-5 border-b border-gray-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<svg className="h-5 w-5 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 6V10M9 3H15L16 8H8L9 3ZM17 14C17 16.7614 14.7614 19 12 19C9.23858 19 7 16.7614 7 14H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<h2 className="text-lg font-bold">Nutrition Tracker</h2>
					</div>
					<div className="flex items-center gap-2">
						{showGoalEditor ? (
							<div className="flex items-center gap-2">
								<input
									type="number"
									min="500"
									max="10000"
									value={tempGoal}
									onChange={(e) => setTempGoal(Number(e.target.value))}
									className="w-20 text-sm border border-gray-300 rounded-2xl px-2 py-1"
								/>
								<button
									onClick={saveCalorieGoal}
									className="text-xs bg-emerald text-white px-2 py-1 rounded-2xl"
								>
									Save
								</button>
							</div>
						) : (
							<motion.div 
								className="text-maximum font-medium flex items-center gap-1 cursor-pointer"
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.3 }}
								onClick={() => setShowGoalEditor(true)}
							>
								<span>{nutrition.calories} / {calorieGoal} Cal</span>
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
								</svg>
							</motion.div>
						)}
					</div>
				</div>
				<div className="mt-2 w-full bg-gray-200 rounded-full h-2">
					<motion.div 
						className="h-2 rounded-full bg-maximum"
						initial={{ width: 0 }}
						animate={{ width: `${calculatePercentage('calories')}%` }}
						transition={{ duration: 1, ease: "easeOut" }}
					></motion.div>
				</div>
			</div>
			
			<div className="p-5">
				<motion.div 
					className="bg-antique-light p-4 rounded-2xl mb-6"
					initial="hidden"
					animate="show"
					variants={{
						hidden: { opacity: 0, x: -20 },
						show: { 
							opacity: 1, 
							x: 0,
							transition: {
								duration: 0.4,
								type: "spring",
								stiffness: 100
							}
						}
					}}
					whileHover={{ scale: 1.01, backgroundColor: "#f7f0e0" }}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<svg className="h-5 w-5 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
							<span className="ml-2 text-gray-700">Daily nutrition tracking</span>
						</div>
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							onClick={resetNutrition}
							className="cursor-pointer"
						>
							<svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
							</svg>
						</motion.div>
					</div>
				</motion.div>
				
				<motion.div 
					className="grid grid-cols-2 gap-6 mb-6"
					initial="hidden"
					animate="show"
					variants={container}
				>
					<NutritionBar 
						label="Protein" 
						value={`${nutrition.protein}g`}
						percentage={calculatePercentage('protein')} 
						color="bg-emerald" 
					/>
					
					<NutritionBar 
						label="Fats" 
						value={`${nutrition.fats}g`}
						percentage={calculatePercentage('fats')} 
						color="bg-maximum" 
					/>
					
					<NutritionBar 
						label="Carbs" 
						value={`${nutrition.carbs}g`}
						percentage={calculatePercentage('carbs')} 
						color="bg-pastel" 
					/>
					
					<NutritionBar 
						label="Fiber" 
						value={`${nutrition.fiber}g`}
						percentage={calculatePercentage('fiber')} 
						color="bg-emerald-light" 
					/>
				</motion.div>
				
				{savedFoods.length > 0 && (
					<motion.div
						className="mt-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<h3 className="font-medium text-gray-700 mb-3">Recent Food Log</h3>
						<div className="space-y-3 max-h-60 overflow-y-auto pr-1">
							{savedFoods.map((food) => (
								<motion.div 
									key={food.id}
									className="bg-gray-50 p-3 rounded-2xl relative"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								>
									<div className="flex justify-between items-start">
										<div>
											<div className="flex items-center">
												<span className="font-medium">{food.name}</span>
												<span className="ml-2 text-xs bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
													{food.calories} cal
												</span>
											</div>
											<div className="mt-1 flex space-x-3 text-xs text-gray-500">
												<span>P: {food.protein}g</span>
												<span>C: {food.carbs}g</span>
												<span>F: {food.fats}g</span>
												{food.addedAt && (
													<span>{formatTime(food.addedAt)}</span>
												)}
											</div>
										</div>
										<button 
											onClick={() => removeFood(food.id)}
											className="text-red-400 hover:text-red-600 transition-colors"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
											</svg>
										</button>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
				
				{savedFoods.length === 0 && (
					<motion.div
						className="mt-6 text-center py-6 bg-gray-50 rounded-2xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
						</svg>
						<p className="mt-2 text-gray-500">No food logged today</p>
						<p className="text-sm text-gray-400">Add food to track your nutrition</p>
					</motion.div>
				)}
			</div>
		</motion.div>
	)
})

function NutritionBar({ label, value, percentage, color }) {
	return (
		<motion.div variants={{
			hidden: { opacity: 0, y: 10 },
			show: { 
				opacity: 1, 
				y: 0,
				transition: {
					type: "spring",
					stiffness: 300,
					damping: 20
				}
			}
		}}>
			<div className="flex justify-between items-center mb-1">
				<span className="text-sm font-medium text-gray-600">{label}</span>
				<span className="text-sm font-medium">{value}</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
				<motion.div 
					className={`${color} h-2 rounded-full`} 
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
				></motion.div>
			</div>
		</motion.div>
	)
}

export default NutritionTracker