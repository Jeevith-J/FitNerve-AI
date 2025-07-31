import "@/styles/globals.css"
import { useEffect } from 'react'
import { addFlipStyles } from '@/components/styles'

export default function App({ Component, pageProps }) {
  // Add 3D flip styles to the document when the app loads
  useEffect(() => {
    addFlipStyles()
  }, [])
  
  return <Component {...pageProps} />
}