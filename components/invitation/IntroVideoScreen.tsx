'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { resolveVideo } from '@/lib/utils/videoEmbed'

interface IntroVideoScreenProps {
  videoUrl: string
  coupleNames: string
  accentColor: string
  onComplete: () => void
  hideOverlay?: boolean
}

export function IntroVideoScreen({
  videoUrl,
  coupleNames,
  accentColor,
  onComplete,
  hideOverlay = false,
}: IntroVideoScreenProps) {
  const videoRef    = useRef<HTMLVideoElement | null>(null)
  const [isVisible, setIsVisible]         = useState(false)
  const [showSkip, setShowSkip]           = useState(false)
  const [progress, setProgress]           = useState(0)
  const [exiting, setExiting]             = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const hasCompletedRef = useRef(false)
  const skipTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const video   = resolveVideo(videoUrl, { autoplay: true, muted: true, loop: false, controls: false })
  const isEmbed = video.type !== 'direct'

  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    setExiting(true)
    setTimeout(() => onComplete(), 900)
  }, [onComplete])

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80)
    skipTimerRef.current = setTimeout(() => setShowSkip(true), 3500)
    return () => {
      clearTimeout(t)
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current)
    }
  }, [])

  // Direct video: autoplay + track progress + handle ended
  useEffect(() => {
    if (isEmbed) return
    const vid = videoRef.current
    if (!vid) return

    const tryPlay = () => {
      vid.play().catch(() => setAutoplayBlocked(true))
    }
    const onTimeUpdate = () => {
      if (vid.duration) setProgress(vid.currentTime / vid.duration)
    }
    const onEnded = () => handleComplete()

    vid.addEventListener('canplaythrough', tryPlay, { once: true })
    vid.addEventListener('timeupdate', onTimeUpdate)
    vid.addEventListener('ended', onEnded)
    vid.load()

    return () => {
      vid.removeEventListener('canplaythrough', tryPlay)
      vid.removeEventListener('timeupdate', onTimeUpdate)
      vid.removeEventListener('ended', onEnded)
    }
  }, [isEmbed, handleComplete])

  const handleSkip = () => {
    if (videoRef.current) videoRef.current.pause()
    handleComplete()
  }

  const handleTapToPlay = () => {
    videoRef.current?.play().then(() => setAutoplayBlocked(false)).catch(() => {})
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
      style={{
        opacity: isVisible && !exiting ? 1 : 0,
        transition: exiting
          ? 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)'
          : 'opacity 0.6s ease',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* ── Video layer — fullscreen, no borders ── */}
      {isEmbed ? (
        /*
          Iframe scaled 110% + translateY trick: hides the YouTube/Vimeo
          thin top/bottom bars that some platforms inject.
          pointer-events: none prevents the iframe from capturing clicks (skip still works).
        */
        <div
          className="absolute"
          style={{
            top: '-5%',
            left: '-5%',
            width: '110%',
            height: '110%',
          }}
        >
          <iframe
            src={video.embedUrl}
            className="w-full h-full"
            style={{ border: 'none', outline: 'none' }}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen={false}
            title="Intro video"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          playsInline
          preload="auto"
          muted={false}
        />
      )}

      {/* ── Cinematic edges ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.68) 100%)' }}
      />
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/75 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

      {/* ── Couple name overlay — always visible over iframe (if not hidden) ── */}
      {!hideOverlay && (
        <div
          className="absolute bottom-10 sm:bottom-14 inset-x-0 flex flex-col items-center gap-1.5 px-6 pointer-events-none text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1.2s ease 0.8s, transform 1.2s ease 0.8s',
          }}
        >
          <p
            className="text-[9px] sm:text-[11px] uppercase tracking-[0.5em] font-light"
            style={{ color: accentColor, opacity: 0.85 }}
          >
            You Are Invited To Celebrate
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white drop-shadow-2xl leading-tight"
            style={{ textShadow: `0 0 60px ${accentColor}40, 0 2px 8px rgba(0,0,0,0.9)` }}
          >
            {coupleNames}
          </h2>
          <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.35em] font-light text-white/40 mt-0.5">
            Wedding Invitation
          </p>
        </div>
      )}

      {/* ── Progress bar (direct video only) ── */}
      {!isEmbed && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/10 pointer-events-none">
          <div
            className="h-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(to right, ${accentColor}88, ${accentColor})`,
              transition: 'width 0.3s linear',
            }}
          />
        </div>
      )}

      {/* ── Skip button ── */}
      {showSkip && !exiting && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold text-white/75 border border-white/20 backdrop-blur-md bg-black/35 hover:bg-black/55 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          style={{ animation: 'fadeInDown 0.5s ease forwards' }}
        >
          Skip
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* ── Tap to play (autoplay blocked — direct video only) ── */}
      {!isEmbed && autoplayBlocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/40 backdrop-blur-sm z-10"
          onClick={handleTapToPlay}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 bg-black/60 hover:bg-black/80 transition-all hover:scale-110"
            style={{ borderColor: `${accentColor}90`, boxShadow: `0 0 40px ${accentColor}40` }}
          >
            <svg className="w-9 h-9 sm:w-10 sm:h-10 translate-x-[3px] text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-xs text-white/60 uppercase tracking-widest">Tap to Play</p>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
