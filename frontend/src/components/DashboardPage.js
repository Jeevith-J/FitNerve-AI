import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import SquatDetector from './SquatDetector'
import UserProfile from './UserProfile'
import WeeklyProgress from './WeeklyProgress'
import NutritionTracker from './NutritionTracker'
import ActivityTracker from './ActivityTracker'
import { SAMPLE_DATA, ANIMATIONS } from '@/constants'

export default function Dashboard({activePage, showComponents}) {
	const [userData, setUserData] = useState(SAMPLE_DATA)
	const [authUser, setAuthUser] = useState(null)
	
	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			const user = JSON.parse(storedUser)
			setAuthUser(user)
			
			// Update the userData with the logged-in user's name
			setUserData(prevData => ({
				...prevData,
				user: {
					...prevData.user,
					name: user.name || user.email.split('@')[0]
				}
			}))
		}
	}, [])
	
	const components = {
		UserProfile: <UserProfile user={userData.user} />,
		WeeklyProgress: <WeeklyProgress progress={userData.weeklyProgress} />,
		NutritionTracker: <NutritionTracker nutrition={userData.nutrition} />,
		ActivityTracker: <ActivityTracker activity={userData.activity} />,
	}
	
	const renderComponents = showComponents?.map((component) => {
		return components[component]
	}) || []
	
	return (
		<div className="min-h-screen bg-cosmic">
			<Header activePage={activePage} />
			
			<main className="container mx-auto px-4 py-6">
				<motion.div 
					className="grid grid-cols-1 lg:grid-cols-3 gap-6"
					initial="hidden"
					animate="visible"
					variants={ANIMATIONS.staggerChildren}
				>
					<motion.div 
						className="lg:col-span-1 space-y-6"
						variants={ANIMATIONS.slideIn}
					>
						<UserProfile user={userData.user} />
						<WeeklyProgress progress={userData.weeklyProgress} />
						<ActivityTracker activity={userData.activity} />
					</motion.div>
					
					<motion.div 
						className="lg:col-span-2 space-y-6"
						variants={ANIMATIONS.slideIn}
					>
						<motion.div 
							className="bg-white rounded-xl shadow-card overflow-hidden"
							whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
						>
							<div className="bg-dark text-white p-4">
								<h2 className="text-xl font-bold">AI Fitness Trainer: Squats Analysis</h2>
							</div>
							<div className="p-4">
								<SquatDetector />
							</div>
						</motion.div>
						
						{renderComponents.map((Component, index) => (
							<motion.div 
								key={index}
								className="bg-white rounded-xl shadow-card overflow-hidden"
								variants={ANIMATIONS.slideIn}
							>
								{Component}
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</main>

			<motion.footer 
				className="mt-12 py-6 text-center text-gray-500 border-t border-gray-200"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.2 }}
			>
				<p>Project by Jeevith</p>
			</motion.footer>
		</div>
	)
}