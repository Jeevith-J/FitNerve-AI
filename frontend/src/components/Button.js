import { motion } from 'framer-motion'

export function Button({ children, onClick, variant = 'primary', className = '', size = 'md', disabled = false }) {
	const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
	
	const variants = {
		primary: `bg-emerald hover:bg-emerald-light text-white focus:ring-emerald`,
		secondary: `bg-maximum hover:bg-maximum-light text-dark focus:ring-maximum`,
		danger: `bg-pastel hover:bg-pastel-light text-white focus:ring-pastel`,
		outline: `bg-transparent border-2 border-emerald text-emerald hover:bg-emerald hover:text-white focus:ring-emerald`,
		ghost: `bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500`
	}
	
	const sizes = {
		sm: 'py-1 px-3 text-sm',
		md: 'py-2 px-4 text-base',
		lg: 'py-3 px-6 text-lg'
	}
	
	const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
	
	return (
		<motion.button
			onClick={onClick}
			disabled={disabled}
			className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClass} ${className}`}
			whileTap={{ scale: disabled ? 1 : 0.98 }}
			whileHover={disabled ? {} : { scale: 1.01 }}
			transition={{ duration: 0.1 }}
		>
			{children}
		</motion.button>
	)
}