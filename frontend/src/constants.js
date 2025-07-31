export const COLORS = {
	emerald: '#317039',
	maximum: '#F1BE49',
	pastel: '#CC4B24',
	antique: '#F8EDD9',
	papaya: '#FFF1D4', 
	cosmic: '#FFFBEB',
	dark: '#333333',
	gray: '#6B7280'
}

export const ANIMATIONS = {
	cardHover: {
		rest: {
			scale: 1,
			boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
			transition: { duration: 0.2, ease: 'easeInOut' }
		},
		hover: {
			scale: 1.01,
			boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
			transition: { duration: 0.2, ease: 'easeInOut' }
		}
	},
	buttonTap: {
		tap: { scale: 0.98 }
	},
	fadeIn: {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.4 } }
	},
	staggerChildren: {
		hidden: { opacity: 0 },
		visible: { 
			opacity: 1,
			transition: { staggerChildren: 0.05, delayChildren: 0.1 }
		}
	},
	slideIn: {
		hidden: { y: 20, opacity: 0 },
		visible: { 
			y: 0, 
			opacity: 1, 
			transition: { type: 'spring', stiffness: 400, damping: 25 }
		}
	}
}

export const SAMPLE_DATA = {
	user: {
		name: 'Jeevith',
		avatar: '/globe.svg'
	},
	stats: {
		correct: 12,
		incorrect: 3
	},
	weeklyProgress: {
		goal: 7,
		current: 2,
		percentage: 29,
		days: [
			{ day: 'Mon', completed: true },
			{ day: 'Tue', completed: true },
			{ day: 'Wed', completed: false },
			{ day: 'Thu', completed: false },
			{ day: 'Fri', completed: false },
			{ day: 'Sat', completed: false },
			{ day: 'Sun', completed: false }
		]
	},
	nutrition: {
		calories: 1650,
		protein: 25,
		fats: 15,
		carbs: 60,
		fiber: 10
	},
	activity: {
		weight: {
			current: 75.5,
			lost: 0
		},
		workout: {
			calories: 361,
			goal: 325
		},
		steps: {
			count: 7229,
			goal: 10000
		},
		sleep: {
			hours: 6.5,
			goal: 8
		},
		water: {
			glasses: 5,
			goal: 11
		}
	},
	squatSession: {
		feedback: '3',
		history: [
			{ time: '09:15', type: 'correct', message: 'Perfect form!' },
			{ time: '09:14', type: 'incorrect', message: 'Knees caving inward' },
			{ time: '09:13', type: 'correct', message: 'Good depth' },
			{ time: '09:12', type: 'correct', message: 'Nice control' }
		]
	}
}