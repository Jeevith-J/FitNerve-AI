import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ANIMATIONS } from '@/constants'
import { useAuth } from '@/components/authClient'
import { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'

export default function AuthPage() {
	const router = useRouter()
	const [isLogin, setIsLogin] = useState(true)
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		name: '',
		age: '',
		gender: 'male',
		dietType: 'non-vegetarian',
		height: '',
		weight: '',
		fitnessGoal: 'build-muscle'
	})
	const [errors, setErrors] = useState({})
	const { loading: authLoading, signin, signup } = useAuth()
	
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value
		})
		
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: undefined
			})
		}
	}
	
	const validateForm = () => {
		const newErrors = {}
		
		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid'
		}
		
		if (!formData.password) {
			newErrors.password = 'Password is required'
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters'
		}
		
		if (!isLogin) {
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match'
			}
			
			if (!formData.name) {
				newErrors.name = 'Name is required'
			}
			
			if (!formData.age) {
				newErrors.age = 'Age is required'
			} else if (isNaN(formData.age) || formData.age < 13 || formData.age > 100) {
				newErrors.age = 'Please enter a valid age between 13 and 100'
			}
			
			if (!formData.height) {
				newErrors.height = 'Height is required'
			} else if (isNaN(formData.height) || formData.height < 100 || formData.height > 250) {
				newErrors.height = 'Please enter a valid height in cm (100-250)'
			}
			
			if (!formData.weight) {
				newErrors.weight = 'Weight is required'
			} else if (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 300) {
				newErrors.weight = 'Please enter a valid weight in kg (30-300)'
			}
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!validateForm()) {
			return
		}
		
		try {
			if (isLogin) {
				await signin(formData.email, formData.password)
			} else {
				await signup(formData)
			}
			
			router.push('/')
		} catch (error) {
			console.error('Auth error:', error)
		}
	}
	
	const toggleAuthMode = () => {
		setIsLogin(!isLogin)
		setErrors({})
	}
	
	return (
		<div className="min-h-screen bg-[#111] flex flex-col justify-center items-center p-4">
			<Toaster position="top-center" />
			<motion.div
				className="w-full max-w-md"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="text-center mb-6">
					<motion.div 
						className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#317039] mb-4"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6.5 17.5L17.5 6.5M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</motion.div>
					<h1 className="text-3xl font-bold text-white">AI Fitness</h1>
					<p className="text-gray-400 mt-2">{isLogin ? 'Sign in to your account' : 'Create your account'}</p>
				</div>
			
				<motion.div
					className="bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden"
					variants={ANIMATIONS ? ANIMATIONS.slideIn : {}}
					initial="hidden"
					animate="visible"
				>
					<div className="p-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
									placeholder="your@email.com"
								/>
								{errors.email && (
									<p className="text-[#CC4B24] text-xs mt-1">{errors.email}</p>
								)}
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-1">
									Password
								</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleInputChange}
									className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
									placeholder="••••••••"
								/>
								{errors.password && (
									<p className="text-[#CC4B24] text-xs mt-1">{errors.password}</p>
								)}
							</div>
							
							{!isLogin && (
								<>
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-1">
											Confirm Password
										</label>
										<input
											type="password"
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleInputChange}
											className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
											placeholder="••••••••"
										/>
										{errors.confirmPassword && (
											<p className="text-[#CC4B24] text-xs mt-1">{errors.confirmPassword}</p>
										)}
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-1">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
											placeholder="John Doe"
										/>
										{errors.name && (
											<p className="text-[#CC4B24] text-xs mt-1">{errors.name}</p>
										)}
									</div>
									
									<div className="grid grid-cols-3 gap-3">
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-1">
												Age
											</label>
											<input
												type="number"
												name="age"
												value={formData.age}
												onChange={handleInputChange}
												className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
												placeholder="25"
											/>
											{errors.age && (
												<p className="text-[#CC4B24] text-xs mt-1">{errors.age}</p>
											)}
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-1">
												Height (cm)
											</label>
											<input
												type="number"
												name="height"
												value={formData.height}
												onChange={handleInputChange}
												className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
												placeholder="175"
											/>
											{errors.height && (
												<p className="text-[#CC4B24] text-xs mt-1">{errors.height}</p>
											)}
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-1">
												Weight (kg)
											</label>
											<input
												type="number"
												name="weight"
												value={formData.weight}
												onChange={handleInputChange}
												className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
												placeholder="70"
											/>
											{errors.weight && (
												<p className="text-[#CC4B24] text-xs mt-1">{errors.weight}</p>
											)}
										</div>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-1">
											Gender
										</label>
										<select
											name="gender"
											value={formData.gender}
											onChange={handleInputChange}
											className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
										>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="prefer-not-to-say">Prefer not to say</option>
										</select>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-1">
											Diet Preference
										</label>
										<select
											name="dietType"
											value={formData.dietType}
											onChange={handleInputChange}
											className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
										>
											<option value="non-vegetarian">Non-vegetarian</option>
											<option value="vegetarian">Vegetarian</option>
											<option value="vegan">Vegan</option>
											<option value="pescatarian">Pescatarian</option>
										</select>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-1">
											Fitness Goal
										</label>
										<select
											name="fitnessGoal"
											value={formData.fitnessGoal}
											onChange={handleInputChange}
											className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#317039] focus:border-transparent"
										>
											<option value="lose-weight">Lose Weight</option>
											<option value="build-muscle">Build Muscle</option>
											<option value="increase-strength">Increase Strength</option>
											<option value="improve-endurance">Improve Endurance</option>
											<option value="general-fitness">General Fitness</option>
										</select>
									</div>
								</>
							)}
							
							<motion.button
								type="submit"
								className="w-full bg-[#317039] hover:bg-[#3d8a47] text-white font-medium py-3 px-4 rounded-lg transition-colors"
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.98 }}
								disabled={authLoading}
							>
								{authLoading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										{isLogin ? 'Signing in...' : 'Creating account...'}
									</div>
								) : (
									<>{isLogin ? 'Sign in' : 'Create account'}</>
								)}
							</motion.button>
						</form>
						
						<div className="text-center mt-6">
							<p className="text-gray-400">
								{isLogin ? "Don't have an account?" : "Already have an account?"}
								<button
									type="button"
									onClick={toggleAuthMode}
									className="ml-2 text-[#F1BE49] hover:text-[#f7d37a] focus:outline-none"
								>
									{isLogin ? 'Sign up' : 'Sign in'}
								</button>
							</p>
						</div>
					</div>
				</motion.div>
				
				{isLogin && (
					<motion.div
						className="mt-8 text-center space-y-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.5 }}
					>
						<p className="text-gray-400 text-sm">AI-powered fitness tracking and nutrition</p>
						<div className="flex justify-center space-x-4 text-sm">
							<span className="text-[#F1BE49]">Personalized Workouts</span>
							<span className="text-gray-500">•</span>
							<span className="text-[#CC4B24]">Diet Analysis</span>
							<span className="text-gray-500">•</span>
							<span className="text-[#317039]">Progress Tracking</span>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	)
}