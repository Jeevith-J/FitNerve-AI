import { motion } from 'framer-motion'
import { ScaleIcon, FireIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Card } from './Card'

export default function ActivityTracker({ activity }) {
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				delayChildren: 0.3,
				staggerChildren: 0.1
			}
		}
	}
	
	return (
		<Card title="Activity">
			<motion.div 
				className="space-y-5"
				initial="hidden"
				animate="show"
				variants={container}
			>
				<ActivityItem
					icon={<ScaleIcon className="h-5 w-5 text-gray-500" />}
					label="Weight"
					value={`${activity.weight.lost} kg lost`}
					buttonIcon={<PlusIcon className="h-5 w-5 text-gray-500" />}
				/>
				
				<ActivityItem
					icon={<FireIcon className="h-5 w-5 text-pastel" />}
					label="Workout"
					value={`${activity.workout.calories} of ${activity.workout.goal} cal burnt`}
					buttonIcon={<PlusIcon className="h-5 w-5 text-gray-500" />}
				/>
				
				<ActivityItem
					icon={
						<svg className="h-5 w-5 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 5L5 19M6.5 9C7.88071 9 9 7.88071 9 6.5C9 5.11929 7.88071 4 6.5 4C5.11929 4 4 5.11929 4 6.5C4 7.88071 5.11929 9 6.5 9ZM17.5 20C18.8807 20 20 18.8807 20 17.5C20 16.1193 18.8807 15 17.5 15C16.1193 15 15 16.1193 15 17.5C15 18.8807 16.1193 20 17.5 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					}
					label="Steps"
					value={`${activity.steps.count} of ${activity.steps.goal} steps`}
					buttonIcon={<ArrowPathIcon className="h-5 w-5 text-gray-500" />}
				/>
				
				<ActivityItem
					icon={
						<svg className="h-5 w-5 text-maximum" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<path d="M12 9V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					}
					label="Sleep"
					value={`Goal: ${activity.sleep.goal}hr`}
					buttonIcon={<ArrowPathIcon className="h-5 w-5 text-gray-500" />}
				/>
				
				<ActivityItem
					icon={
						<svg className="h-5 w-5 text-pastel" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<path d="M3 12H4M12 3V4M20 12H21M12 20V21M5.63605 5.63604L6.3431 6.34309M18.364 5.63604L17.6569 6.34309M6.3431 17.6569L5.63605 18.364M17.6569 17.6569L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					}
					label="Water"
					value={`Goal: ${activity.water.goal} glasses`}
					buttonIcon={<PlusIcon className="h-5 w-5 text-gray-500" />}
				/>
			</motion.div>
		</Card>
	)
}

function ActivityItem({ icon, label, value, buttonIcon }) {
	return (
		<motion.div 
			className="flex items-center justify-between"
			variants={{
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
			}}
		>
			<div className="flex items-center">
				<motion.div 
					className="bg-gray-100 p-2 rounded-full"
					whileHover={{ scale: 1.05, backgroundColor: "#f0f9ff" }}
					whileTap={{ scale: 0.98 }}
				>
					{icon}
				</motion.div>
				<div className="ml-3">
					<h3 className="font-medium">{label}</h3>
					<p className="text-sm text-gray-500">{value}</p>
				</div>
			</div>
			<motion.button 
				className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
				whileHover={{ scale: 1.1, backgroundColor: "#f0f9ff" }}
				whileTap={{ scale: 0.95 }}
			>
				{buttonIcon}
			</motion.button>
		</motion.div>
	)
}