import { motion } from 'framer-motion'

const UploadIndicator = ({ progress, status }) => {
	let statusText = 'Uploading...'
	
	if (progress > 40 && progress < 90) {
		statusText = 'Processing...'
	} else if (progress >= 90) {
		statusText = 'Finalizing...'
	}
	
	if (status) {
		statusText = status
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<motion.div 
				className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<h3 className="text-lg font-semibold mb-4 text-center">
					{statusText}
				</h3>
				
				<div className="w-full bg-gray-200 rounded-full h-3 mb-4">
					<motion.div 
						className="h-3 rounded-full bg-emerald" 
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5 }}
					/>
				</div>
				
				<p className="text-center text-sm text-gray-500">
					This may take a few minutes depending on video size
				</p>
				
				<div className="flex justify-center mt-5">
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							repeatType: "loop"
						}}
					>
						<svg className="w-8 h-8 text-emerald" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
							<path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</motion.div>
				</div>
			</motion.div>
		</div>
	)
}

export default UploadIndicator