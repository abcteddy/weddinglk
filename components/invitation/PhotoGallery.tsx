'use client'

import { useState } from 'react'
import { getOptimizedImageUrl } from '@/lib/utils/image'

interface PhotoGalleryProps {
  urls: string[]
  accentColor: string
}

export function PhotoGallery({ urls, accentColor }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!urls || urls.length === 0) return null

  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? urls.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev === urls.length - 1 ? 0 : prev + 1))
  }

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(prev => (prev === null || prev === 0 ? urls.length - 1 : prev - 1))
  }

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex(prev => (prev === null || prev === urls.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl text-center text-white tracking-wide">
        📸 Our Photo Gallery
      </h3>

      {/* Main Slider Display */}
      <div
        className="relative aspect-[4/3] max-w-lg mx-auto rounded-sm overflow-hidden border bg-black/40 group shadow-2xl"
        style={{ borderColor: accentColor + '20' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <picture>
          <source srcSet={getOptimizedImageUrl(urls[activeIndex], { width: 800, format: 'avif' })} type="image/avif" />
          <source srcSet={getOptimizedImageUrl(urls[activeIndex], { width: 800, format: 'webp' })} type="image/webp" />
          <img
            src={getOptimizedImageUrl(urls[activeIndex], { width: 800, format: 'origin' })}
            alt={`Gallery image ${activeIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in transition-all duration-300"
            onClick={() => setLightboxIndex(activeIndex)}
          />
        </picture>

        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          ❮
        </button>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          ❯
        </button>

        {/* Slide indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/55 px-3 py-1.5 rounded-full border border-white/5">
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{
                background: activeIndex === idx ? accentColor : 'rgba(255,255,255,0.3)',
                transform: activeIndex === idx ? 'scale(1.2)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
        {urls.map((url, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="w-16 h-12 rounded-sm overflow-hidden border transition-all cursor-pointer hover:opacity-100"
            style={{
              borderColor: activeIndex === idx ? accentColor : 'rgba(255,255,255,0.1)',
              opacity: activeIndex === idx ? 1 : 0.6,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <picture>
              <source srcSet={getOptimizedImageUrl(url, { width: 120, format: 'avif' })} type="image/avif" />
              <source srcSet={getOptimizedImageUrl(url, { width: 120, format: 'webp' })} type="image/webp" />
              <img src={getOptimizedImageUrl(url, { width: 120, format: 'origin' })} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </picture>
          </button>
        ))}
      </div>

      {/* Lightbox Overlay Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in p-4 cursor-zoom-out"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white text-3xl font-light hover:text-rose-400 transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Lightbox Image Container */}
          <div className="relative max-w-4xl max-h-[80vh] aspect-auto select-none" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <picture>
              <source srcSet={getOptimizedImageUrl(urls[lightboxIndex], { width: 1200, format: 'avif' })} type="image/avif" />
              <source srcSet={getOptimizedImageUrl(urls[lightboxIndex], { width: 1200, format: 'webp' })} type="image/webp" />
              <img
                src={getOptimizedImageUrl(urls[lightboxIndex], { width: 1200, format: 'origin' })}
                alt={`Zoomed image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl"
              />
            </picture>

            {/* Lightbox Prev Arrow */}
            <button
              onClick={handleLightboxPrev}
              className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ❮
            </button>

            {/* Lightbox Next Arrow */}
            <button
              onClick={handleLightboxNext}
              className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ❯
            </button>

            {/* Caption */}
            <div className="text-center text-parchment-500 text-sm mt-4 font-serif">
              Image {lightboxIndex + 1} of {urls.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
