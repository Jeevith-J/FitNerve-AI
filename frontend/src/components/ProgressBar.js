import { motion } from 'framer-motion'

export default function ProgressBar({ 
	percentage, 
	height = 2, 
	color = 'bg-emerald', 
	backgroundColor = 'bg-gray-200',
	animate = true 
}) {
	return (
		<div className={`w-full ${backgroundColor} rounded-full h-${height} overflow-hidden`}>
			{animate ? (
				<motion.div 
					className={`${color} h-${height} rounded-full`} 
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				/>
			) : (
				<div 
					className={`${color} h-${height} rounded-full`} 
					style={{ width: `${percentage}%` }}
				/>
			)}
		</div>
	)
}