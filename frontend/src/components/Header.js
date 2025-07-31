import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({activePage}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const links = [
		{ name: 'Dashboard', href: '/' },
		{ name: 'Workouts', href: '/workouts' },
		{ name: 'Planner', href: '/planner' },
		{ name: 'Stats', href: '/stats' },
		{ name: 'Nutrition', href: '/nutrition' },
	]
	return (
		<header className="bg-white shadow-sm">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<motion.div 
							className="flex items-center"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="h-8 w-8 bg-emerald rounded-md flex items-center justify-center">
								<svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M6.5 17.5L17.5 6.5M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<span className="ml-2 font-bold text-xl">AI Fitness</span>
						</motion.div>
						
						<motion.nav 
							className="hidden md:flex ml-8"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.4 }}
						>
							{
								links.map((link) => (
									<NavLink key={link.name} href={link.href} isActive={activePage === link.href}>
										{link.name}
									</NavLink>
								))
							}
						</motion.nav>
					</div>
					
					<div className="flex items-center">
						<motion.button 
							className="p-2 text-gray-600 rounded-full hover:bg-gray-100 mr-2"
							whileTap={{ scale: 0.95 }}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</motion.button>
						
						<motion.button 
							className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
							whileTap={{ scale: 0.95 }}
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M19.4 15C19.1277 15.8031 19.2583 16.6718 19.7611 17.3581C20.2639 18.0444 21.0798 18.4428 21.9 18.43C21.9682 17.284 21.7648 16.1427 21.31 15.1C20.7985 13.9358 19.9738 12.9475 18.9146 12.2488C17.8554 11.5501 16.6043 11.1668 15.33 11.14C14.0557 11.1132 12.7929 11.4438 11.7124 12.0907C10.632 12.7377 9.7717 13.6758 9.22 14.8M4.6 9C4.87233 8.1969 4.74167 7.32825 4.23886 6.64187C3.73606 5.95548 2.92023 5.55717 2.1 5.57C2.03178 6.71603 2.23519 7.85734 2.69 8.9C3.20146 10.0642 4.02617 11.0525 5.08535 11.7512C6.14453 12.4499 7.39567 12.8332 8.67 12.86C9.94427 12.8868 11.2071 12.5562 12.2876 11.9093C13.368 11.2623 14.2283 10.3242 14.78 9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</motion.button>
						
						<div className="ml-4 relative">
							<motion.button 
								className="h-8 w-8 rounded-full bg-maximum flex items-center justify-center"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								whileTap={{ scale: 0.95 }}
							>
								<span className="text-dark font-bold">W</span>
							</motion.button>
							
							<AnimatePresence>
								{isMenuOpen && (
									<motion.div 
										className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
									>
										<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
										<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
										<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}

function NavLink({ href, children, isActive = false }) {
	return (
		<Link href={href} legacyBehavior>
			<a className={`px-3 py-2 relative ${isActive ? 'text-emerald font-medium' : 'text-gray-600 hover:text-emerald'}`}>
				{children}
				{isActive && (
					<motion.div
						className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald"
						layoutId="navIndicator"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2 }}
					/>
				)}
			</a>
		</Link>
	)
}