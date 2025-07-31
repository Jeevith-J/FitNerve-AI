import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import ExerciseTracker from '@/components/ExerciseTracker'
import CalorieCalculator from '@/components/CalorieCalculator'
import { SAMPLE_DATA, ANIMATIONS } from '@/constants'

export default function WorkoutsTrackersPage({ activePage }) {
	const [userData] = useState(SAMPLE_DATA)
	const [activeTab, setActiveTab] = useState('exercise')
	
	return (
		<div className="min-h-screen bg-dark">
			<Header activePage="/workouts" />
			
			<main className="container mx-auto px-4 py-6">
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="text-3xl font-bold text-white">Workouts & Trackers</h1>
					<p className="text-gray-400 mt-2">
						Track your exercises, calculate calories, and manage your fitness journey
					</p>
				</motion.div>
				
				{/* Tab Navigation */}
				<div className="mb-6 bg-gray-800 rounded-lg p-1 flex">
					<TabButton 
						label="Exercise Tracker" 
						isActive={activeTab === 'exercise'} 
						onClick={() => setActiveTab('exercise')} 
					/>
					<TabButton 
						label="Calorie Calculator" 
						isActive={activeTab === 'calories'} 
						onClick={() => setActiveTab('calories')} 
					/>
				</div>
				
				{/* Content Section */}
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
				>
					{activeTab === 'exercise' ? (
						<ExerciseTracker exerciseData={userData} />
					) : (
						<CalorieCalculator userData={userData} />
					)}
				</motion.div>
			</main>
			
			<motion.footer 
				className="mt-12 py-6 text-center text-gray-500 border-t border-gray-700"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
			>
				<p>Project by Jeevith</p>
			</motion.footer>
		</div>
	)
}

function TabButton({ label, isActive, onClick }) {
	return (
		<button
			onClick={onClick}
			className={`flex-1 py-3 px-4 rounded-md text-center font-medium transition-colors ${
				isActive 
					? 'bg-emerald text-white' 
					: 'text-gray-300 hover:text-white hover:bg-gray-700'
			}`}
		>
			{label}
		</button>
	)
}