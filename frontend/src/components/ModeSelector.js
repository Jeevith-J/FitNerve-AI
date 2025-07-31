import { motion } from 'framer-motion'

const ModeCard = ({ title, description, icon, active, onClick }) => {
	return (
		<motion.div
			className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
				active ? 'border-emerald bg-emerald-light/20' : 'border-gray-200 hover:border-emerald'
			}`}
			onClick={onClick}
			whileHover={{ y: -5 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-start">
				<div className={`mr-4 p-3 rounded-full ${active ? 'bg-emerald' : 'bg-gray-100'}`}>
					{icon}
				</div>
				<div>
					<h3 className="font-semibold text-dark mb-1">{title}</h3>
					<p className="text-sm text-gray-600">{description}</p>
				</div>
			</div>
		</motion.div>
	)
}


const ModeSelector = ({ mode, setMode }) => {
	return (
		<div className="bg-white p-5 rounded-xl shadow-lg">
			<h2 className="text-xl font-semibold text-dark mb-4">Training Mode</h2>
			<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
				<ModeCard
					title="Beginner"
					description="More forgiving form requirements, ideal for learning proper technique"
					icon={
						<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					}
					active={mode === 'beginner'}
					onClick={() => setMode('beginner')}
				/>
				
				<ModeCard
					title="Pro"
					description="Stricter form requirements for advanced trainers and athletes"
					icon={
						<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					}
					active={mode === 'pro'}
					onClick={() => setMode('pro')}
				/>
			</div>
		</div>
	)
}
export default ModeSelector
