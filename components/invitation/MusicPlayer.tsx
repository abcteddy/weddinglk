'use client'

import { useEffect, useRef, useState } from 'react'

interface MusicPlayerProps {
  url: string
  autoPlayTrigger: boolean
}

export function MusicPlayer({ url, autoPlayTrigger }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Trigger play when autoPlayTrigger becomes true (i.e. user clicks to open envelope)
  useEffect(() => {
    if (audioRef.current && autoPlayTrigger && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(err => {
          console.warn('Autoplay blocked by browser policy. User interaction required.', err)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayTrigger])

  // Play music synchronously when custom window event is dispatched
  useEffect(() => {
    const playMusic = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(err => {
            console.warn('Synchronous play blocked or failed:', err)
          })
      }
    }

    window.addEventListener('play-wedding-music', playMusic)
    return () => {
      window.removeEventListener('play-wedding-music', playMusic)
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(err => {
          console.error('Play failed:', err)
        })
    }
  }

  return (
    <>
      <audio ref={audioRef} src={url} loop />
      
      {/* Component-scoped animation style */}
      <style>{`
        @keyframes music-bar-anim {
          from {
            height: 20%;
          }
          to {
            height: 100%;
          }
        }
        .animate-bar-1 { animation: music-bar-anim 0.8s ease-in-out infinite alternate; }
        .animate-bar-2 { animation: music-bar-anim 0.5s ease-in-out infinite alternate 0.15s; }
        .animate-bar-3 { animation: music-bar-anim 0.7s ease-in-out infinite alternate 0.3s; }
        .animate-bar-4 { animation: music-bar-anim 0.6s ease-in-out infinite alternate 0.45s; }
      `}</style>

      <button
        onClick={togglePlay}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black/75 border border-white/10 text-white flex items-center justify-center hover:bg-black/90 backdrop-blur-md transition-all shadow-lg active:scale-95 hover:scale-105 cursor-pointer"
        title={isPlaying ? 'Mute Music' : 'Play Music'}
      >
        {isPlaying ? (
          // Soundwave animation
          <div className="flex items-end gap-[3px] h-4">
            <span className="w-[3px] bg-rose-400 rounded-full animate-bar-1" style={{ height: '60%' }} />
            <span className="w-[3px] bg-rose-400 rounded-full animate-bar-2" style={{ height: '90%' }} />
            <span className="w-[3px] bg-rose-400 rounded-full animate-bar-3" style={{ height: '40%' }} />
            <span className="w-[3px] bg-rose-400 rounded-full animate-bar-4" style={{ height: '80%' }} />
          </div>
        ) : (
          // Muted Speaker icon
          <svg className="w-5 h-5 text-parchment-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>
    </>
  )
}
