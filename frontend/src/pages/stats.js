import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { Card } from '@/components/Card';
import { SAMPLE_DATA } from '@/constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Animation variants
const animations = {
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  }
};

// Colors based on the provided palette
const COLORS = {
  emerald: '#317039',
  maximum: '#F1BE49',
  cosmic: '#1A1A1A',
  pastel: '#CC4B24',
  antique: '#F8EDD9',
  dark: '#121212',
  darkAlt: '#1E1E1E',
  lightText: '#E0E0E0',
  mediumText: '#ABABAB',
  darkText: '#232323'
};

export default function StatsPage({ activePage }) {
  const [userData] = useState(SAMPLE_DATA);
  const [activeTimeframe, setActiveTimeframe] = useState('daily');
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      const generateData = () => {
        const timeframes = {
          daily: {
            dateRange: 'Today, Apr 12',
            caloriesBurned: Math.floor(Math.random() * 300) + 300,
            stepsCount: Math.floor(Math.random() * 3000) + 5000,
            exerciseMinutes: Math.floor(Math.random() * 30) + 30,
            caloriesConsumed: Math.floor(Math.random() * 500) + 1500,
            waterIntake: Math.floor(Math.random() * 4) + 4,
            sleepHours: Math.floor(Math.random() * 2) + 6,
            completedWorkouts: Math.floor(Math.random() * 2),
            mood: ['Great', 'Good', 'Okay', 'Tired'][Math.floor(Math.random() * 4)],
            hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              value: Math.floor(Math.random() * 100)
            }))
          },
          weekly: {
            dateRange: 'Apr 6 - Apr 12',
            caloriesBurned: Math.floor(Math.random() * 1000) + 2000,
            stepsCount: Math.floor(Math.random() * 10000) + 30000,
            exerciseMinutes: Math.floor(Math.random() * 100) + 150,
            caloriesConsumed: Math.floor(Math.random() * 2000) + 10000,
            waterIntake: Math.floor(Math.random() * 10) + 30,
            sleepHours: Math.floor(Math.random() * 5) + 40,
            completedWorkouts: Math.floor(Math.random() * 3) + 3,
            mood: ['Generally Great', 'Mostly Good', 'Mixed', 'Somewhat Tired'][Math.floor(Math.random() * 4)],
            dailyActivity: Array.from({ length: 7 }, (_, i) => ({
              day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
              value: Math.floor(Math.random() * 100)
            }))
          },
          monthly: {
            dateRange: 'Mar 13 - Apr 12',
            caloriesBurned: Math.floor(Math.random() * 5000) + 8000,
            stepsCount: Math.floor(Math.random() * 50000) + 120000,
            exerciseMinutes: Math.floor(Math.random() * 300) + 600,
            caloriesConsumed: Math.floor(Math.random() * 5000) + 40000,
            waterIntake: Math.floor(Math.random() * 40) + 120,
            sleepHours: Math.floor(Math.random() * 10) + 160,
            completedWorkouts: Math.floor(Math.random() * 8) + 12,
            mood: ['Trending Up', 'Consistent', 'Variable', 'Improving'][Math.floor(Math.random() * 4)],
            weeklyActivity: Array.from({ length: 4 }, (_, i) => ({
              week: `Week ${i + 1}`,
              value: Math.floor(Math.random() * 100)
            }))
          }
        };
        
        return timeframes[activeTimeframe];
      };
      
      setStatsData(generateData());
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTimeframe]);
  
  const getGoalPercentage = (current, type) => {
    const goals = {
      steps: { daily: 10000, weekly: 70000, monthly: 280000 },
      workouts: { daily: 1, weekly: 5, monthly: 20 },
      water: { daily: 8, weekly: 56, monthly: 224 }
    };
    
    if (!current || !goals[type] || !goals[type][activeTimeframe]) return 0;
    return Math.min(Math.round((current / goals[type][activeTimeframe]) * 100), 100);
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.dark }}>
      <Header activePage="/stats" />
      
      <main className="container mx-auto px-4 py-6">
        <motion.div
          className="mb-6"
          initial={animations.slideIn.initial}
          animate={animations.slideIn.animate}
          transition={animations.slideIn.transition}
        >
          <h1 className="text-3xl font-bold" style={{ color: COLORS.lightText }}>Statistics & Progress</h1>
          <p style={{ color: COLORS.mediumText }} className="mt-2">
            Track your fitness journey with detailed stats and insights
          </p>
        </motion.div>
        
        {/* Timeframe Selector */}
        <motion.div 
          style={{ backgroundColor: COLORS.darkAlt }}
          className="p-6 rounded-xl shadow-xl mb-6"
          initial={animations.slideIn.initial}
          animate={animations.slideIn.animate}
          transition={animations.slideIn.transition}
        >
          <div className="flex items-center space-x-6">
            <TimeframeButton 
              isActive={activeTimeframe === 'daily'} 
              onClick={() => setActiveTimeframe('daily')}
              label="Daily"
              colors={COLORS}
            />
            <TimeframeButton 
              isActive={activeTimeframe === 'weekly'} 
              onClick={() => setActiveTimeframe('weekly')}
              label="Weekly"
              colors={COLORS}
            />
            <TimeframeButton 
              isActive={activeTimeframe === 'monthly'} 
              onClick={() => setActiveTimeframe('monthly')}
              label="Monthly"
              colors={COLORS}
            />
          </div>
          
          <motion.div 
            style={{ backgroundColor: COLORS.cosmic }}
            className="mt-3 p-4 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            key={activeTimeframe}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-medium text-lg mb-1" style={{ color: COLORS.lightText }}>
                {activeTimeframe === 'daily' ? '📅 Daily Stats' : 
                 activeTimeframe === 'weekly' ? '📊 Weekly Overview' : '📈 Monthly Progress'}
              </h3>
              <p style={{ color: COLORS.mediumText }}>
                {isLoading ? 'Loading statistics...' : 
                 `Viewing data for: ${statsData?.dateRange}`}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Stats Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              className="flex justify-center items-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: COLORS.emerald }}></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTimeframe}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Activity Summary Card */}
              <motion.div 
                className="md:col-span-3"
                initial={animations.slideIn.initial}
                animate={animations.slideIn.animate}
                transition={animations.slideIn.transition}
              >
                <Card className="overflow-hidden rounded-xl">
                  <div style={{ backgroundColor: COLORS.emerald }} className="text-white p-5 rounded-t-xl">
                    <h2 className="text-xl font-bold">Activity Summary</h2>
                  </div>
                  <div style={{ backgroundColor: COLORS.darkAlt }} className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatBox 
                        icon="🔥" 
                        value={statsData.caloriesBurned}
                        label="Calories Burned"
                        color={COLORS.emerald}
                      />
                      <StatBox 
                        icon="👟" 
                        value={statsData.stepsCount.toLocaleString()}
                        label="Steps"
                        color={COLORS.maximum}
                      />
                      <StatBox 
                        icon="⏱️" 
                        value={`${statsData.exerciseMinutes} min`}
                        label="Active Time"
                        color={COLORS.emerald}
                      />
                      <StatBox 
                        icon="🍽️" 
                        value={statsData.caloriesConsumed.toLocaleString()}
                        label="Calories Consumed"
                        color={COLORS.pastel}
                      />
                    </div>
                    
                    <h3 className="font-medium mt-6 mb-3" style={{ color: COLORS.lightText }}>
                      Activity Chart
                    </h3>
                    <div style={{ backgroundColor: COLORS.dark }} className="p-4 rounded-lg">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          {activeTimeframe === 'daily' ? (
                            <LineChart data={statsData.hourlyActivity}>
                              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.darkAlt} />
                              <XAxis 
                                dataKey="hour" 
                                stroke={COLORS.mediumText}
                                tickFormatter={(hour) => hour % 6 === 0 ? `${hour}:00` : ''}
                              />
                              <YAxis stroke={COLORS.mediumText} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: COLORS.dark, borderColor: COLORS.emerald }}
                                labelFormatter={(hour) => `${hour}:00`}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={COLORS.emerald} 
                                strokeWidth={2}
                                dot={{ fill: COLORS.emerald, r: 4 }}
                                activeDot={{ r: 6, fill: COLORS.maximum }}
                              />
                            </LineChart>
                          ) : activeTimeframe === 'weekly' ? (
                            <BarChart data={statsData.dailyActivity}>
                              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.darkAlt} />
                              <XAxis dataKey="day" stroke={COLORS.mediumText} />
                              <YAxis stroke={COLORS.mediumText} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: COLORS.dark, borderColor: COLORS.emerald }}
                              />
                              <Bar 
                                dataKey="value" 
                                fill={COLORS.emerald} 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          ) : (
                            <BarChart data={statsData.weeklyActivity}>
                              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.darkAlt} />
                              <XAxis dataKey="week" stroke={COLORS.mediumText} />
                              <YAxis stroke={COLORS.mediumText} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: COLORS.dark, borderColor: COLORS.emerald }}
                              />
                              <Bar 
                                dataKey="value" 
                                fill={COLORS.emerald} 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Steps Goal Card */}
              <motion.div 
                initial={animations.slideIn.initial}
                animate={animations.slideIn.animate}
                transition={animations.slideIn.transition}
              >
                <Card className="h-full rounded-xl">
                  <div style={{ backgroundColor: COLORS.maximum }} className="text-dark p-5 rounded-t-xl">
                    <h2 className="text-xl font-bold">Steps Goal</h2>
                  </div>
                  <div style={{ backgroundColor: COLORS.darkAlt }} className="p-5">
                    <div className="text-center mb-5">
                      <div className="text-sm mb-1" style={{ color: COLORS.mediumText }}>Your Progress</div>
                      <div className="text-3xl font-bold" style={{ color: COLORS.maximum }}>
                        {getGoalPercentage(statsData.stepsCount, 'steps')}%
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <ProgressBar 
                        percentage={getGoalPercentage(statsData.stepsCount, 'steps')}
                        height={6}
                        color={COLORS.maximum}
                      />
                      <div className="flex justify-between mt-2 text-xs" style={{ color: COLORS.mediumText }}>
                        <span>0 steps</span>
                        <span>Goal: {activeTimeframe === 'daily' ? '10,000' : 
                          activeTimeframe === 'weekly' ? '70,000' : '280,000'} steps</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: COLORS.dark }}>
                      <div className="text-center">
                        <div className="text-sm font-medium" style={{ color: COLORS.mediumText }}>Current</div>
                        <div className="text-2xl font-bold" style={{ color: COLORS.lightText }}>
                          {statsData.stepsCount.toLocaleString()} steps
                        </div>
                        <div className="text-xs mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Today' : 
                           activeTimeframe === 'weekly' ? 'This week' : 'This month'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Workout Goal Card */}
              <motion.div 
                initial={animations.slideIn.initial}
                animate={animations.slideIn.animate}
                transition={animations.slideIn.transition}
              >
                <Card className="h-full rounded-xl">
                  <div style={{ backgroundColor: COLORS.emerald }} className="text-white p-5 rounded-t-xl">
                    <h2 className="text-xl font-bold">Workout Goal</h2>
                  </div>
                  <div style={{ backgroundColor: COLORS.darkAlt }} className="p-5">
                    <div className="text-center mb-5">
                      <div className="text-sm mb-1" style={{ color: COLORS.mediumText }}>Your Progress</div>
                      <div className="text-3xl font-bold" style={{ color: COLORS.emerald }}>
                        {getGoalPercentage(statsData.completedWorkouts, 'workouts')}%
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <ProgressBar 
                        percentage={getGoalPercentage(statsData.completedWorkouts, 'workouts')}
                        height={6}
                        color={COLORS.emerald}
                      />
                      <div className="flex justify-between mt-2 text-xs" style={{ color: COLORS.mediumText }}>
                        <span>0 workouts</span>
                        <span>Goal: {activeTimeframe === 'daily' ? '1' : 
                          activeTimeframe === 'weekly' ? '5' : '20'} workouts</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: COLORS.dark }}>
                      <div className="text-center">
                        <div className="text-sm font-medium" style={{ color: COLORS.mediumText }}>Completed</div>
                        <div className="text-2xl font-bold" style={{ color: COLORS.lightText }}>
                          {statsData.completedWorkouts} workout{statsData.completedWorkouts !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Today' : 
                           activeTimeframe === 'weekly' ? 'This week' : 'This month'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Water Goal Card */}
              <motion.div 
                initial={animations.slideIn.initial}
                animate={animations.slideIn.animate}
                transition={animations.slideIn.transition}
              >
                <Card className="h-full rounded-xl">
                  <div style={{ backgroundColor: COLORS.antique }} className="text-dark p-5 rounded-t-xl">
                    <h2 className="text-xl font-bold">Water Intake</h2>
                  </div>
                  <div style={{ backgroundColor: COLORS.darkAlt }} className="p-5">
                    <div className="text-center mb-5">
                      <div className="text-sm mb-1" style={{ color: COLORS.mediumText }}>Your Progress</div>
                      <div className="text-3xl font-bold" style={{ color: COLORS.maximum }}>
                        {getGoalPercentage(statsData.waterIntake, 'water')}%
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <ProgressBar 
                        percentage={getGoalPercentage(statsData.waterIntake, 'water')}
                        height={6}
                        color={COLORS.maximum}
                      />
                      <div className="flex justify-between mt-2 text-xs" style={{ color: COLORS.mediumText }}>
                        <span>0 glasses</span>
                        <span>Goal: {activeTimeframe === 'daily' ? '8' : 
                          activeTimeframe === 'weekly' ? '56' : '224'} glasses</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: COLORS.dark }}>
                      <div className="text-center">
                        <div className="text-sm font-medium" style={{ color: COLORS.mediumText }}>Consumed</div>
                        <div className="text-2xl font-bold" style={{ color: COLORS.lightText }}>
                          {statsData.waterIntake} glass{statsData.waterIntake !== 1 ? 'es' : ''}
                        </div>
                        <div className="text-xs mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Today' : 
                           activeTimeframe === 'weekly' ? 'This week' : 'This month'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Additional Details Card */}
              <motion.div 
                initial={animations.slideIn.initial}
                animate={animations.slideIn.animate}
                transition={animations.slideIn.transition}
                className="md:col-span-3"
              >
                <Card className="overflow-hidden rounded-xl">
                  <div style={{ backgroundColor: COLORS.pastel }} className="text-white p-5 rounded-t-xl">
                    <h2 className="text-xl font-bold">Detailed Breakdown</h2>
                  </div>
                  <div style={{ backgroundColor: COLORS.darkAlt }} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div style={{ backgroundColor: COLORS.dark }} className="p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div style={{ backgroundColor: COLORS.pastel }} className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">
                            ⏰
                          </div>
                          <h3 className="font-medium" style={{ color: COLORS.lightText }}>Sleep</h3>
                        </div>
                        <div className="text-2xl font-bold mt-2" style={{ color: COLORS.lightText }}>
                          {statsData.sleepHours} hours
                        </div>
                        <div className="text-sm mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Last night' : 
                           activeTimeframe === 'weekly' ? 'Average: 7.1 hours/night' : 'Average: 7.2 hours/night'}
                        </div>
                      </div>
                      
                      <div style={{ backgroundColor: COLORS.dark }} className="p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div style={{ backgroundColor: COLORS.emerald }} className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">
                            🏋️
                          </div>
                          <h3 className="font-medium" style={{ color: COLORS.lightText }}>Active Time</h3>
                        </div>
                        <div className="text-2xl font-bold mt-2" style={{ color: COLORS.lightText }}>
                          {statsData.exerciseMinutes} minutes
                        </div>
                        <div className="text-sm mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Today' : 
                           activeTimeframe === 'weekly' ? 'This week' : 'This month'}
                        </div>
                      </div>
                      
                      <div style={{ backgroundColor: COLORS.dark }} className="p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div style={{ backgroundColor: COLORS.maximum }} className="w-8 h-8 rounded-full flex items-center justify-center text-dark mr-3">
                            😊
                          </div>
                          <h3 className="font-medium" style={{ color: COLORS.lightText }}>Mood</h3>
                        </div>
                        <div className="text-2xl font-bold mt-2" style={{ color: COLORS.lightText }}>
                          {statsData.mood}
                        </div>
                        <div className="text-sm mt-1" style={{ color: COLORS.mediumText }}>
                          {activeTimeframe === 'daily' ? 'Today\'s mood' : 
                           activeTimeframe === 'weekly' ? 'Weekly average' : 'Monthly trend'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <motion.footer 
        className="mt-12 py-6 text-center border-t"
        style={{ color: COLORS.mediumText, borderColor: COLORS.darkAlt }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p>Project by Jeevith</p>
      </motion.footer>
    </div>
  );
}

function TimeframeButton({ isActive, onClick, label, colors }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-lg font-medium text-lg`}
      style={{ 
        color: isActive ? colors.lightText : colors.mediumText 
      }}
      whileHover={!isActive ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: colors.emerald }}
          layoutId="activeTimeframe"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

function StatBox({ icon, value, label, color }) {
  return (
    <div className="p-4 rounded-lg" style={{ 
      backgroundColor: COLORS.dark,
      borderLeft: `4px solid ${color}`
    }}>
      <div className="flex items-center mb-2">
        <div className="text-2xl mr-3">{icon}</div>
        <div className="font-bold text-xl" style={{ color: COLORS.lightText }}>{value}</div>
      </div>
      <div className="text-sm" style={{ color: COLORS.mediumText }}>{label}</div>
    </div>
  );
}

// Custom ProgressBar component that properly fills based on percentage
function ProgressBar({ percentage, height, color }) {
  return (
    <div 
      className="w-full rounded-full overflow-hidden" 
      style={{ 
        height: `${height}px`, 
        backgroundColor: COLORS.dark 
      }}
    >
      <div 
        className="h-full rounded-full transition-all duration-500 ease-in-out" 
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color 
        }}
      />
    </div>
  );
}