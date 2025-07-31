import { motion } from 'framer-motion'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { Card } from './Card'

export default function WeeklyProgress({ progress }) {
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
	
	const item = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0 }
	}
	
	return (
		<Card title="Weekly Progress">
			<motion.div
				initial="hidden"
				animate="show"
				variants={container}
			>
				<motion.div variants={item} className="flex justify-between items-center mb-2">
					<div className="flex items-center">
						<div className="h-4 w-4 rounded-full border-2 border-emerald flex items-center justify-center">
							<div className="h-2 w-2 rounded-full bg-emerald"></div>
						</div>
						<span className="ml-2 text-sm">Goal: {progress.goal} workouts</span>
					</div>
					<div className="flex items-center">
						<svg className="h-4 w-4 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<span className="ml-1 text-sm">Current: {progress.current}</span>
					</div>
				</motion.div>
				
				<motion.div variants={item} className="my-4">
					<div className="bg-gray-200 h-2 rounded-full overflow-hidden">
						<motion.div 
							className="bg-emerald h-2 rounded-full" 
							initial={{ width: 0 }}
							animate={{ width: `${progress.percentage}%` }}
							transition={{ duration: 0.8, ease: "easeOut" }}
						></motion.div>
					</div>
					<div className="text-right mt-1">
						<span className="text-sm font-medium text-emerald">{progress.percentage}%</span>
					</div>
				</motion.div>
				
				<motion.div variants={item} className="grid grid-cols-7 gap-1 mt-6">
					{progress.days.map((day, index) => (
						<DayBox key={index} day={day} index={index} />
					))}
				</motion.div>
			</motion.div>
		</Card>
	)
}

function DayBox({ day, index }) {
	return (
		<motion.div 
			className="text-center"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.05 + 0.3 }}
		>
			<div className="text-xs text-gray-500 mb-1">{day.day}</div>
			<motion.div 
				className={`h-10 w-full rounded ${day.completed ? 'bg-emerald' : 'bg-gray-100'}`}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				transition={{ duration: 0.2 }}
			></motion.div>
		</motion.div>
	)
}