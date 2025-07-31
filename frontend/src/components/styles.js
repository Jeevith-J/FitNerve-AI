// Add this file to your components directory to enable the 3D flip effect

export const addFlipStyles = () => {
  if (typeof document !== 'undefined') {
    // Create a style element
    const style = document.createElement('style')
    
    // Add the CSS for flip card
    style.textContent = `
      .perspective-1000 {
        perspective: 1000px;
      }
      
      .transform-style-3d {
        transform-style: preserve-3d;
      }
      
      .backface-hidden {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
      }
    `
    
    // Add the style to the head of the document
    document.head.appendChild(style)
  }
}

// Export any other styling utilities here
export const getFormQualityColor = (percentage) => {
  if (percentage >= 80) return 'text-emerald'
  if (percentage >= 50) return 'text-maximum-dark'
  return 'text-pastel'
}