import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from './Card'
import ProgressBar from './ProgressBar'

export default function AIDietPlanner({ userData }) {
	const [isGenerating, setIsGenerating] = useState(false)
	const [dietPlan, setDietPlan] = useState(null)
	const [error, setError] = useState(null)
	const [formData, setFormData] = useState({
		calorieGoal: userData?.nutrition?.calories || 2000,
		dietType: 'balanced',
		dietPreference: 'non-vegetarian',
		meals: 3,
		allergies: '',
		excludeIngredients: ''
	})
	
	// Load user data from localStorage
	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			try {
				const user = JSON.parse(storedUser)
				
				// Update dietPreference if available in user data
				if (user.dietType) {
					setFormData(prevData => ({
						...prevData,
						dietPreference: user.dietType
					}))
				}
				
				// If user has a fitness goal, set appropriate diet type
				if (user.fitnessGoal) {
					let dietType = 'balanced'
					switch (user.fitnessGoal) {
						case 'lose-weight':
							dietType = 'low-carb'
							break
						case 'build-muscle':
							dietType = 'high-protein'
							break
						case 'increase-strength':
							dietType = 'high-protein'
							break
						case 'improve-endurance':
							dietType = 'balanced'
							break
					}
					
					setFormData(prevData => ({
						...prevData,
						dietType
					}))
				}
			} catch (error) {
				console.error('Error parsing user data:', error)
			}
		}
	}, [])
	
	// Load saved plan from localStorage on mount
	useEffect(() => {
		const savedPlan = localStorage.getItem('aiDietPlan')
		if (savedPlan) {
			try {
				setDietPlan(JSON.parse(savedPlan))
			} catch (error) {
				console.error('Error parsing saved diet plan:', error)
			}
		}
	}, [])
	
	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: name === 'calorieGoal' || name === 'meals' ? parseInt(value) : value
		})
	}
	
	// Generate diet plan using Gemini API
	const generateDietPlan = async () => {
		setIsGenerating(true)
		setError(null)
		
		try {
			// Create prompt for Gemini API
			const prompt = `Create a personalized diet plan with the following specifications:
				- Daily calorie goal: ${formData.calorieGoal} calories
				- Diet type: ${formData.dietType}
				- Dietary preference: ${formData.dietPreference}
				- Number of meals per day: ${formData.meals}
				${formData.allergies ? '- Allergies/intolerances to avoid: ' + formData.allergies : ''}
				${formData.excludeIngredients ? '- Ingredients to exclude: ' + formData.excludeIngredients : ''}
				
				Provide a structured meal plan with exact macronutrient breakdowns (protein, carbs, fats) for each meal.
				Format the response as JSON with the following structure:
				{
					"calories": total daily calories,
					"dietType": diet type name,
					"preference": dietary preference,
					"meals": number of meals,
					"mealPlan": [
						{
							"type": meal type (Breakfast, Lunch, etc.),
							"name": meal name,
							"calories": calories in this meal,
							"protein": protein in grams,
							"carbs": carbs in grams,
							"fats": fats in grams
						},
						... (more meals)
					],
					"macros": {
						"protein": total protein in grams,
						"carbs": total carbs in grams,
						"fats": total fats in grams
					}
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
				throw new Error('Failed to generate diet plan');
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
			
			setDietPlan(generatedPlan);
			
			// Save to localStorage
			localStorage.setItem('aiDietPlan', JSON.stringify(generatedPlan));
		} catch (error) {
			console.error('Error generating diet plan:', error);
			setError('Failed to generate diet plan. Please try again.');
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
			setDietPlan(null)
			localStorage.removeItem('aiDietPlan')
		}
	}
	
	return (
		<Card className="h-full overflow-visible">
			<div className="bg-dark text-white p-4">
				<h2 className="text-xl font-bold">AI Diet Planner</h2>
			</div>
			
			<div className="p-4">
				{!dietPlan ? (
					<motion.div 
						className="space-y-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Daily Calorie Goal
							</label>
							<input
								type="number"
								name="calorieGoal"
								value={formData.calorieGoal}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Diet Type
							</label>
							<select
								name="dietType"
								value={formData.dietType}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="balanced">Balanced</option>
								<option value="low-carb">Low Carb</option>
								<option value="high-protein">High Protein</option>
								<option value="ketogenic">Ketogenic</option>
								<option value="mediterranean">Mediterranean</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Dietary Preference
							</label>
							<select
								name="dietPreference"
								value={formData.dietPreference}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value="non-vegetarian">Non-Vegetarian</option>
								<option value="vegetarian">Vegetarian</option>
								<option value="vegan">Vegan</option>
								<option value="pescatarian">Pescatarian</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Number of Meals per Day
							</label>
							<select
								name="meals"
								value={formData.meals}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-md"
							>
								<option value={3}>3 Meals</option>
								<option value={4}>4 Meals (with Snack)</option>
								<option value={5}>5 Meals (with 2 Snacks)</option>
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Allergies or Intolerances
							</label>
							<input
								type="text"
								name="allergies"
								value={formData.allergies}
								onChange={handleInputChange}
								placeholder="E.g., peanuts, dairy, gluten"
								className="w-full p-2 border border-gray-300 rounded-md"
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Ingredients to Exclude
							</label>
							<input
								type="text"
								name="excludeIngredients"
								value={formData.excludeIngredients}
								onChange={handleInputChange}
								placeholder="E.g., mushrooms, cilantro"
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
							onClick={generateDietPlan}
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
									Generating Diet Plan...
								</div>
							) : 'Generate Diet Plan with AI'}
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
								<div className="text-gray-500 mb-1">Personalized Diet Plan</div>
								<div className="text-xl font-bold text-emerald">
									{dietPlan.calories} Calories
								</div>
								<div className="text-xs text-gray-500">
									{dietPlan.dietType} - {dietPlan.preference}
								</div>
								{dietPlan.generatedAt && (
									<div className="text-xs text-gray-400 mt-1">
										Generated: {formatDate(dietPlan.generatedAt)}
									</div>
								)}
							</div>
							
							<div className="grid grid-cols-3 gap-3 mt-4">
								<MacroCard label="Protein" value={`${dietPlan.macros.protein}g`} color="emerald" />
								<MacroCard label="Carbs" value={`${dietPlan.macros.carbs}g`} color="maximum" />
								<MacroCard label="Fats" value={`${dietPlan.macros.fats}g`} color="pastel" />
							</div>
						</div>
						
						<div className="space-y-3">
							{dietPlan.mealPlan.map((meal, index) => (
								<MealCard key={index} meal={meal} />
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

// Macro Card Component
function MacroCard({ label, value, color }) {
	return (
		<div className={`bg-white p-3 rounded-lg shadow-sm border-l-4 border-${color}`}>
			<div className="text-sm text-gray-500">{label}</div>
			<div className="font-semibold text-lg">{value}</div>
		</div>
	)
}

// Meal Card Component
function MealCard({ meal }) {
	const [expanded, setExpanded] = useState(false)
	
	return (
		<motion.div 
			className="bg-white rounded-lg shadow-sm overflow-hidden"
			initial={false}
			animate={{ height: expanded ? 'auto' : '76px' }}
		>
			<div 
				className="p-4 cursor-pointer"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex justify-between items-center">
					<div>
						<div className="text-sm text-gray-500">{meal.type}</div>
						<div className="font-medium">{meal.name}</div>
					</div>
					<div className="flex items-center">
						<div className="text-emerald font-medium mr-2">{meal.calories} cal</div>
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
				<div className="px-4 pb-4 pt-1 bg-gray-50">
					<div className="flex justify-between text-sm border-t border-gray-200 pt-2">
						<div className="grid grid-cols-3 gap-4 w-full">
							<div>
								<div className="text-xs text-gray-500">Protein</div>
								<div className="font-medium">{meal.protein}g</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Carbs</div>
								<div className="font-medium">{meal.carbs}g</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Fats</div>
								<div className="font-medium">{meal.fats}g</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</motion.div>
	)
}