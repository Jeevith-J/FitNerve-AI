import Image from 'next/image'
import { motion } from 'framer-motion'
import { ANIMATIONS } from '@/constants'

export default function UserProfile({ user }) {
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	}
	
	const item = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0 }
	}
	
	return (
		<motion.div 
			className="bg-white rounded-xl shadow-card overflow-hidden"
			initial="hidden"
			animate="show"
			variants={container}
		>
			<div className="flex items-center bg-dark text-white p-4">
				<motion.div 
					className="relative h-14 w-14 rounded-full overflow-hidden bg-maximum flex items-center justify-center"
					variants={item}
					whileHover={{ scale: 1.05 }}
				>
					{user.avatar ? (
						<Image
							src={user.avatar}
							alt={user.name}
							width={56}
							height={56}
							className="object-cover"
						/>
					) : (
						<span className="text-2xl font-bold text-dark">
							{user.name.charAt(0)}
						</span>
					)}
				</motion.div>
				<motion.div className="ml-4" variants={item}>
					<h2 className="text-2xl font-bold">{user.name}</h2>
				</motion.div>
			</div>
			
			<div className="p-4">
				<motion.div 
					className="flex justify-between mb-4" 
					variants={item}
				>
					<StatBox label="Sessions" value="24" />
					<StatBox label="Level" value="Pro" />
					<StatBox label="Points" value="3840" />
				</motion.div>
				
				<motion.div className="mt-6" variants={item}>
					<motion.button 
						className="w-full bg-emerald hover:bg-emerald-light text-white py-2 rounded-md font-medium transition-colors"
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.98 }}
					>
						View Profile
					</motion.button>
				</motion.div>
			</div>
		</motion.div>
	)
}

function StatBox({ label, value }) {
	return (
		<motion.div 
			className="text-center"
			whileHover={{ scale: 1.05 }}
			transition={{ duration: 0.2 }}
		>
			<span className="block text-sm text-gray-500">{label}</span>
			<span className="text-xl font-bold">{value}</span>
		</motion.div>
	)
}