'use client'

import { useEffect, useState } from 'react'

interface GoogleFontLoaderProps {
  fonts: string[]
}

export function GoogleFontLoader({ fonts }: GoogleFontLoaderProps) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([])

  useEffect(() => {
    if (!fonts || fonts.length === 0) return

    const uniqueFonts = Array.from(new Set(fonts.filter(Boolean)))
    
    // Check if we need to load any new fonts
    const fontsToLoad = uniqueFonts.filter(font => !loadedFonts.includes(font))
    
    if (fontsToLoad.length === 0) return

    fontsToLoad.forEach(fontName => {
      const formattedName = fontName.replace(/\s+/g, '+')
      const linkId = `google-font-${formattedName.toLowerCase()}`

      // Skip if already exists in document
      if (document.getElementById(linkId)) return

      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;700&display=swap`
      document.head.appendChild(link)
    })

    setLoadedFonts(prev => [...prev, ...fontsToLoad])
  }, [fonts, loadedFonts])

  return null
}
