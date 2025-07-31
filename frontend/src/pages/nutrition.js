import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { Card } from '@/components/Card'
import { ANIMATIONS, COLORS } from '@/constants'
import NutritionTracker from '@/components/NutritionTracker'

export default function NutritionPage({ activePage }) {
	const [searchQuery, setSearchQuery] = useState('')
	const [foodData, setFoodData] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [searchHistory, setSearchHistory] = useState([])
	const trackerRef = useRef(null)
	
	const handleSearch = async (e) => {
		e.preventDefault()
		
		if (!searchQuery.trim()) return
		
		setIsLoading(true)
		setError(null)
		
		try {
			const prompt = `Provide comprehensive nutritional information about "${searchQuery}".
Include the following details:
- Brief description of what it is
- Origin and cultural significance
- Complete nutritional breakdown (calories, protein, carbs, fats, vitamins, minerals)
- Health benefits and potential drawbacks
- When it's recommended to eat this food (time of day, season, etc.)
- Food combinations that go well with it
- At least 3 interesting facts about this food
- Special preparation techniques or cooking methods

Format the response as JSON with the following structure:
{
  "name": "food name",
  "description": "brief description",
  "origin": "where it's from",
  "nutrition": {
    "calories": "per 100g",
    "protein": "in grams",
    "carbs": "in grams",
    "fats": "in grams",
    "fiber": "in grams", 
    "vitamins": ["list of key vitamins", "with amounts if known"],
    "minerals": ["list of key minerals", "with amounts if known"]
  },
  "healthBenefits": ["list of health benefits"],
  "healthDrawbacks": ["potential drawbacks or concerns"],
  "recommendedTimes": ["when to eat it"],
  "goodCombinations": ["foods that pair well"],
  "funFacts": ["interesting facts"],
  "preparationTips": ["preparation or cooking tips"]
}
`
			
			const response = await fetch('/api/generate-ai-content', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt }),
			})
			
			if (!response.ok) {
				throw new Error('Failed to fetch food information')
			}
			
			const data = await response.json()
			
			let parsedData
			try {
				parsedData = typeof data.content === 'object'
					? data.content
					: JSON.parse(data.content)
			} catch (err) {
				const jsonMatch = data.content.match(/\{[\s\S]*\}/)
				if (jsonMatch) {
					parsedData = JSON.parse(jsonMatch[0])
				} else {
					throw new Error('Failed to parse food information')
				}
			}
			
			setFoodData(parsedData)
			
			if (!searchHistory.includes(searchQuery)) {
				setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5))
			}
		} catch (err) {
			console.error('Error fetching food data:', err)
			setError('Failed to get information about this food. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}
	
	const handleHistoryClick = (query) => {
		setSearchQuery(query)
		const mockEvent = { preventDefault: () => {} }
		handleSearch(mockEvent)
	}
	
	const handleAddToTracker = () => {
		if (!foodData || !trackerRef.current) return
		
		// Extract numerical values from strings
		const calories = parseInt(foodData.nutrition.calories) || 0
		const protein = parseInt(foodData.nutrition.protein) || 0
		const carbs = parseInt(foodData.nutrition.carbs) || 0
		const fats = parseInt(foodData.nutrition.fats) || 0
		const fiber = parseInt(foodData.nutrition.fiber) || 0
		
		const foodItem = {
			name: foodData.name,
			calories,
			protein,
			carbs,
			fats,
			fiber
		}
		
		// Call the addFood method directly on the tracker component
		trackerRef.current.addFood(foodItem)
	}
	
	return (
		<div className="min-h-screen bg-dark">
			<Header activePage="/nutrition" />
			
			<main className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<motion.div
							className="mb-6"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="text-3xl font-bold text-white">Nutrition Explorer</h1>
							<p className="text-gray-400 mt-2">
								Discover detailed nutritional information about any food
							</p>
						</motion.div>
						
						<motion.div
							className="w-full bg-cosmic rounded-2xl shadow-lg p-6 mb-6"
							variants={ANIMATIONS.slideIn}
							initial="hidden"
							animate="visible"
						>
							<form onSubmit={handleSearch} className="flex">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Enter a food item (e.g., avocado, quinoa, salmon)"
									className="flex-grow p-3 border border-gray-700 bg-gray-800 text-white rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent"
								/>
								<button
									type="submit"
									className="bg-emerald hover:bg-emerald-light text-white font-medium py-3 px-6 rounded-r-2xl transition-colors"
									disabled={isLoading}
								>
									{isLoading ? 'Searching...' : 'Search'}
								</button>
							</form>
							
							{searchHistory.length > 0 && (
								<div className="mt-3">
									<p className="text-sm text-gray-400">Recent searches:</p>
									<div className="flex flex-wrap gap-2 mt-2">
										{searchHistory.map((query, index) => (
											<button
												key={index}
												onClick={() => handleHistoryClick(query)}
												className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-2xl transition-colors"
											>
												{query}
											</button>
										))}
									</div>
								</div>
							)}
						</motion.div>
						
						{isLoading && (
							<div className="w-full flex justify-center items-center py-16">
								<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald"></div>
							</div>
						)}
						
						{error && (
							<motion.div
								className="bg-pastel-light text-pastel-dark p-4 rounded-2xl mb-6"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								{error}
							</motion.div>
						)}
						
						{foodData && !isLoading && (
							<>
								<motion.div
									className="mb-4 flex justify-end"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									<button
										onClick={handleAddToTracker}
										className="bg-maximum text-dark hover:bg-maximum-light font-medium px-4 py-2 rounded-2xl transition-colors flex items-center gap-2"
									>
										<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
										</svg>
										Add to Nutrition Tracker
									</button>
								</motion.div>
							
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}
									className="grid grid-cols-1 md:grid-cols-2 gap-6"
								>
									{/* Overview Card */}
									<motion.div 
										className="md:col-span-2"
										variants={ANIMATIONS.slideIn}
									>
										<Card className="overflow-hidden rounded-2xl">
											<div className="bg-emerald text-white p-5">
												<h2 className="text-2xl font-bold">{foodData.name}</h2>
											</div>
											<div className="p-6 bg-cosmic">
												<p className="text-gray-200 text-lg">{foodData.description}</p>
												
												<div className="mt-4 pt-4 border-t border-gray-700">
													<h3 className="font-medium text-gray-300 mb-2">Origin</h3>
													<p className="text-gray-400">{foodData.origin}</p>
												</div>
											</div>
										</Card>
									</motion.div>
									
									{/* Nutrition Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-maximum text-dark p-5">
												<h2 className="text-xl font-bold">Nutrition Facts</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<div className="grid grid-cols-2 gap-4 mb-6">
													<NutrientCard label="Calories" value={foodData.nutrition.calories} color="emerald" />
													<NutrientCard label="Protein" value={foodData.nutrition.protein} color="maximum" />
													<NutrientCard label="Carbs" value={foodData.nutrition.carbs} color="pastel" />
													<NutrientCard label="Fats" value={foodData.nutrition.fats} color="emerald" />
												</div>
												
												<div className="grid grid-cols-1 gap-5">
													<div className="bg-gray-800 p-4 rounded-2xl">
														<h4 className="font-medium text-maximum mb-2">Vitamins</h4>
														<ul className="space-y-1 text-gray-300">
															{foodData.nutrition.vitamins.map((vitamin, index) => (
																<li key={index} className="flex items-start">
																	<span className="text-maximum mr-2">•</span>
																	<span>{vitamin}</span>
																</li>
															))}
														</ul>
													</div>
													
													<div className="bg-gray-800 p-4 rounded-2xl">
														<h4 className="font-medium text-maximum mb-2">Minerals</h4>
														<ul className="space-y-1 text-gray-300">
															{foodData.nutrition.minerals.map((mineral, index) => (
																<li key={index} className="flex items-start">
																	<span className="text-maximum mr-2">•</span>
																	<span>{mineral}</span>
																</li>
															))}
														</ul>
													</div>
												</div>
											</div>
										</Card>
									</motion.div>
									
									{/* Health Info Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-pastel text-white p-5">
												<h2 className="text-xl font-bold">Health Information</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<div className="mb-5">
													<h3 className="font-medium text-emerald border-b border-gray-700 pb-2 mb-3">Benefits</h3>
													<ul className="space-y-1 text-gray-300">
														{foodData.healthBenefits.map((benefit, index) => (
															<li key={index} className="flex items-start">
																<span className="text-emerald mr-2">✓</span>
																<span>{benefit}</span>
															</li>
														))}
													</ul>
												</div>
												
												<div>
													<h3 className="font-medium text-pastel border-b border-gray-700 pb-2 mb-3">Considerations</h3>
													<ul className="space-y-1 text-gray-300">
														{foodData.healthDrawbacks.length > 0 ? (
															foodData.healthDrawbacks.map((drawback, index) => (
																<li key={index} className="flex items-start">
																	<span className="text-pastel mr-2">!</span>
																	<span>{drawback}</span>
																</li>
															))
														) : (
															<li className="flex items-start">
																<span className="text-emerald mr-2">✓</span>
																<span>No significant health concerns noted.</span>
															</li>
														)}
													</ul>
												</div>
											</div>
										</Card>
									</motion.div>
									
									{/* When to Eat Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-antique text-dark p-5">
												<h2 className="text-xl font-bold">When to Eat</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<ul className="space-y-2 text-gray-300">
													{foodData.recommendedTimes.map((time, index) => (
														<li key={index} className="flex items-start">
															<span className="text-antique mr-2">•</span>
															<span>{time}</span>
														</li>
													))}
												</ul>
											</div>
										</Card>
									</motion.div>
									
									{/* Food Combinations Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-antique text-dark p-5">
												<h2 className="text-xl font-bold">Food Pairings</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<ul className="space-y-2 text-gray-300">
													{foodData.goodCombinations.map((combo, index) => (
														<li key={index} className="flex items-start">
															<span className="text-antique mr-2">•</span>
															<span>{combo}</span>
														</li>
													))}
												</ul>
											</div>
										</Card>
									</motion.div>
									
									{/* Fun Facts Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-maximum text-dark p-5">
												<h2 className="text-xl font-bold">Fun Facts</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<ul className="space-y-3">
													{foodData.funFacts.map((fact, index) => (
														<li key={index} className="bg-gray-800 p-3 rounded-2xl flex items-start">
															<span className="text-maximum mr-2 text-lg">#{index + 1}</span>
															<span className="text-gray-300">{fact}</span>
														</li>
													))}
												</ul>
											</div>
										</Card>
									</motion.div>
									
									{/* Preparation Tips Card */}
									<motion.div variants={ANIMATIONS.slideIn}>
										<Card className="h-full rounded-2xl">
											<div className="bg-emerald text-white p-5">
												<h2 className="text-xl font-bold">Preparation Tips</h2>
											</div>
											<div className="p-5 bg-cosmic">
												<ul className="space-y-2 text-gray-300">
													{foodData.preparationTips.map((tip, index) => (
														<li key={index} className="flex items-start">
															<span className="text-emerald mr-2">•</span>
															<span>{tip}</span>
														</li>
													))}
												</ul>
											</div>
										</Card>
									</motion.div>
								</motion.div>
							</>
						)}
					</div>

					<div className="lg:col-span-1">
						<motion.div
							className="sticky top-6"
							variants={ANIMATIONS.slideIn}
							initial="hidden"
							animate="visible"
						>
							<NutritionTracker ref={trackerRef} />
						</motion.div>
					</div>
				</div>
			</main>
		</div>
	)
}

function NutrientCard({ label, value, color }) {
	return (
		<div className={`bg-gray-800 p-4 rounded-2xl border-l-4 border-${color}`}>
			<div className="text-sm text-gray-400">{label}</div>
			<div className="font-semibold text-lg text-white">{value}</div>
		</div>
	)
}