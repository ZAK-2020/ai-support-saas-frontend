import { useState, useEffect } from 'react'

export const useWindowSize = () => {
  const [size, setSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handle = () => setSize({
      width:  window.innerWidth,
      height: window.innerHeight
    })
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return {
    width:    size.width,
    height:   size.height,
    isMobile: size.width < 768,
    isTablet: size.width < 1024
  }
}