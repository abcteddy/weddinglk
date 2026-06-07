'use client'

import { useRef, useState } from 'react'

interface VideoPlayerProps {
  url: string
  accentColor: string
}

export function VideoPlayer({ url, accentColor }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-center text-white tracking-wide">
        🎬 Our Story Video
      </h3>
      <div
        className="relative aspect-video rounded-sm overflow-hidden border bg-black/50 group shadow-2xl transition-all"
        style={{ borderColor: accentColor + '25' }}
      >
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handlePlayPause}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          controls
        />

        {/* Dynamic Play Overlay (Hidden once playing) */}
        {!isPlaying && (
          <div
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-colors group-hover:bg-black/50"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all bg-black/70 hover:bg-black/90 hover:scale-105 border border-white/20 shadow-lg text-white"
              style={{ color: accentColor }}
            >
              {/* Play icon */}
              <svg className="w-8 h-8 translate-x-[2px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
