import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { addFlipStyles } from './styles'

// This component creates a flippable card with front and back content

const FlipCard = ({ 
  frontContent, 
  backContent, 
  isFlipped = false, 
  onFlip = () => {}, 
  className = '',
  height = 'auto'
}) => {
  // Ensure 3D styles are added to the document
  useEffect(() => {
    addFlipStyles()
  }, [])
  
  // Card flip animation variants
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  }
  
  return (
    <div className={`perspective-1000 ${className}`} style={{ height }}>
      <motion.div 
        className="relative w-full h-full transform-style-3d cursor-pointer"
        initial={false}
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
      >
        {/* Front of card */}
        <motion.div 
          className={`absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-xl
            ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden"
          }}
        >
          {frontContent}
        </motion.div>
        
        {/* Back of card */}
        <motion.div 
          className={`absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-xl
            ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
          style={{ 
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden"
          }}
        >
          {backContent}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FlipCard 