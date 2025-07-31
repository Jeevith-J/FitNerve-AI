import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
  }
}

const SquatStats = ({ stats, feedback, previousWorkouts = [], clearWorkoutHistory }) => {
  // Handle different feedback types
  const renderFeedback = () => {
    if (!feedback) return null
    
    const feedbackMessages = {
      'reset_counters': 'Counters reset due to inactivity',
      'incorrect': 'Improper form detected'
    }
    
    const isNumber = !isNaN(parseInt(feedback))
    const message = isNumber 
      ? `Good squat #${feedback} completed!` 
      : feedbackMessages[feedback] || feedback
    
    const getBgColor = () => {
      if (isNumber) return 'bg-emerald-light text-emerald-dark'
      if (feedback === 'incorrect') return 'bg-pastel-light text-pastel-dark'
      return 'bg-maximum-light text-maximum-dark'
    }
    
    return (
      <motion.div 
        className={`p-4 rounded-lg ${getBgColor()} mb-6`}
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          {isNumber ? (
            <motion.svg 
              className="w-6 h-6 mr-3" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          ) : feedback === 'incorrect' ? (
            <motion.svg 
              className="w-6 h-6 mr-3" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          ) : (
            <motion.svg 
              className="w-6 h-6 mr-3" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
          <motion.span 
            className="text-lg font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {message}
          </motion.span>
        </div>
      </motion.div>
    )
  }

  // Calculate form quality percentage
  const formQuality = stats.correct + stats.incorrect === 0
    ? 0
    : Math.min(Math.floor((stats.correct / (stats.correct + stats.incorrect)) * 100), 100)

  // Get the last 7 days of workouts
  const last7Days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    
    // Find if we have a workout for this day
    const workout = previousWorkouts.find(w => w.date === dateString)
    
    last7Days.push({
      date: dateString,
      displayDate: i === 0 ? 'Today' : date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }).substring(0, 3),
      hasWorkout: !!workout,
      correct: workout ? workout.correct : 0
    })
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-dark">Squat Performance</h2>
        
        {previousWorkouts.length > 0 && (
          <motion.button
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            onClick={clearWorkoutHistory}
          >
            Reset Progress
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {feedback && renderFeedback()}
      </AnimatePresence>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div 
          className="bg-emerald-light p-5 rounded-lg relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background decoration */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13L10 16L17 9" stroke="none"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="none"/>
            </svg>
          </div>
          
          <h3 className="text-emerald-dark font-semibold mb-2">Correct Squats</h3>
          <div className="flex items-baseline">
            <motion.span 
              className="text-4xl font-bold text-emerald"
              key={stats.correct} // Re-animate when value changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {stats.correct}
            </motion.span>
            <span className="ml-2 text-emerald-dark">reps</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-pastel-light p-5 rounded-lg relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background decoration */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="none"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="none"/>
            </svg>
          </div>
          
          <h3 className="text-pastel-dark font-semibold mb-2">Incorrect Squats</h3>
          <div className="flex items-baseline">
            <motion.span 
              className="text-4xl font-bold text-pastel"
              key={stats.incorrect} // Re-animate when value changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {stats.incorrect}
            </motion.span>
            <span className="ml-2 text-pastel-dark">reps</span>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-cosmic p-5 rounded-lg">
        <h3 className="font-semibold mb-3 text-dark">Form Quality</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div 
            className="h-4 rounded-full bg-emerald"
            initial={{ width: 0 }}
            animate={{ width: `${formQuality}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Poor Form (0%)</span>
          <span>Perfect Form (100%)</span>
        </div>
        
        <div className="mt-4 text-center">
          <motion.div 
            className="text-5xl font-bold text-emerald inline-block"
            key={formQuality} // Re-animate when value changes
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {formQuality}%
          </motion.div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-3 text-dark">Recent Sessions</h3>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day, i) => (
            <motion.div 
              key={day.date}
              className={`h-16 rounded-md ${day.hasWorkout ? "bg-emerald-light" : "bg-gray-100"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -5 }}
              style={{ position: 'relative' }}
            >
              {day.hasWorkout && day.correct > 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-emerald-dark font-medium">
                  {day.correct}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {last7Days.map(day => (
            <span key={day.date}>{day.displayDate}</span>
          ))}
        </div>
      </div>
      
      {previousWorkouts.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3 text-dark">Workout History</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {previousWorkouts.map((workout, index) => (
              <motion.div
                key={`${workout.date}-${index}`}
                className="bg-gray-50 p-3 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{formatDate(workout.date)}</span>
                  <span className="text-gray-500 text-sm">{workout.mode === 'beginner' ? 'Beginner' : 'Pro'}</span>
                </div>
                <div className="grid grid-cols-3 mt-2 text-sm">
                  <div>
                    <span className="text-emerald font-semibold">{workout.correct}</span> correct
                  </div>
                  <div>
                    <span className="text-pastel font-semibold">{workout.incorrect}</span> incorrect
                  </div>
                  <div>
                    <span className="font-semibold">{Math.floor(workout.duration / 60)}:{(workout.duration % 60).toString().padStart(2, '0')}</span> mins
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SquatStats