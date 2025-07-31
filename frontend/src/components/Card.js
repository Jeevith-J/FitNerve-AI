import { motion } from 'framer-motion'
import { ANIMATIONS } from '@/constants'

export function Card({ 
	children, 
	title, 
	className = '', 
	contentClassName = '', 
	headerClassName = '',
	animate = true,
	...props 
}) {
	const Component = animate ? motion.div : 'div'
	const animateProps = animate ? {
		initial: "rest",
		whileHover: "hover",
		variants: ANIMATIONS.cardHover
	} : {}

	return (
		<Component
			className={`bg-white rounded-xl shadow-card overflow-hidden ${className}`}
			{...animateProps}
			{...props}
		>
			{title && (
				<div className={`p-4 border-b border-gray-100 ${headerClassName}`}>
					<h2 className="text-lg font-bold">{title}</h2>
				</div>
			)}
			<div className={`p-4 ${contentClassName}`}>
				{children}
			</div>
		</Component>
	)
}