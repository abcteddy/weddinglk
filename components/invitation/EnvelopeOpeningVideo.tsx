'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { resolveVideo } from '@/lib/utils/videoEmbed'

interface EnvelopeOpeningVideoProps {
  videoUrl: string
  coupleNames: string
  guestName?: string
  accentColor: string
  onOpen: () => void
  onFadeOutStart: () => void
}

export function EnvelopeOpeningVideo({
  videoUrl,
  coupleNames,
  guestName,
  accentColor,
  onOpen,
  onFadeOutStart,
}: EnvelopeOpeningVideoProps) {
  const videoRef   = useRef<HTMLVideoElement | null>(null)
  const iframeRef  = useRef<HTMLIFrameElement | null>(null)
  const [phase, setPhase]       = useState<'idle' | 'playing' | 'exiting'>('idle')
  const [isVisible, setIsVisible] = useState(false)
  const hasOpenedRef = useRef(false)

  const video = resolveVideo(videoUrl, { autoplay: false, muted: true, loop: false, controls: false })
  const isEmbed = video.type !== 'direct'

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const triggerExit = useCallback(() => {
    if (hasOpenedRef.current) return
    hasOpenedRef.current = true
    setPhase('exiting')
    onFadeOutStart()
    setTimeout(() => onOpen(), 1500) // 1.5s fade out
  }, [onOpen, onFadeOutStart])

  // For direct video: detect 1.5s before end
  useEffect(() => {
    if (isEmbed) return
    const vid = videoRef.current
    if (!vid) return
    let triggered = false

    const onTimeUpdate = () => {
      if (vid.duration && vid.currentTime >= vid.duration - 1.5) {
        if (!triggered) {
          triggered = true
          triggerExit()
        }
      }
    }
    const onEnded = () => {
      if (!triggered) {
        triggered = true
        triggerExit()
      }
    }

    vid.addEventListener('timeupdate', onTimeUpdate)
    vid.addEventListener('ended', onEnded)
    return () => {
      vid.removeEventListener('timeupdate', onTimeUpdate)
      vid.removeEventListener('ended', onEnded)
    }
  }, [isEmbed, triggerExit])

  // For YouTube/Vimeo iframes: listen to postMessage events
  useEffect(() => {
    if (!isEmbed) return
    let triggered = false

    const onMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data

        // YouTube events
        if (data.event === 'infoDelivery' && data.info) {
          const { currentTime, duration } = data.info
          if (currentTime && duration && currentTime >= duration - 1.5) {
            if (!triggered) {
              triggered = true
              triggerExit()
            }
          }
        }
        if (data.event === 'onStateChange' && data.info === 0) { // 0 = ended
          if (!triggered) {
            triggered = true
            triggerExit()
          }
        }

        // Vimeo events
        if (data.event === 'timeupdate' && data.data) {
          const { seconds, duration } = data.data
          if (seconds && duration && seconds >= duration - 1.5) {
            if (!triggered) {
              triggered = true
              triggerExit()
            }
          }
        }
        if (data.event === 'ended') {
          if (!triggered) {
            triggered = true
            triggerExit()
          }
        }
      } catch (err) {}
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isEmbed, triggerExit])

  const handleClick = () => {
    if (phase !== 'idle') return

    if (isEmbed) {
      // For iframe embeds: clicking starts the embed (autoplay takes over)
      setPhase('playing')
      if (iframeRef.current) {
        // Reload iframe with autoplay=1
        const autoplayUrl = resolveVideo(videoUrl, {
          autoplay: true, muted: true, loop: false, controls: false
        }).embedUrl
        iframeRef.current.src = autoplayUrl
      }
    } else {
      setPhase('playing')
      videoRef.current?.play().catch(() => {})
    }
  }

  const isExiting = phase === 'exiting'
  const isPlaying = phase === 'playing'

  return (
    <div
      className="fixed inset-0 z-[90] bg-[#ebe1da] overflow-hidden"
      style={{
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: isExiting
          ? 'opacity 1.5s cubic-bezier(0.4,0,0.2,1)'
          : 'opacity 0.5s ease',
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* ── Fullscreen Video / Iframe — no borders, no scrollbars ── */}
      {isEmbed ? (
        <iframe
          ref={iframeRef}
          // Start paused (no autoplay). On click we reload src with autoplay=1
          src={video.embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{
            border: 'none',
            outline: 'none',
            pointerEvents: isPlaying ? 'auto' : 'none',
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          title="Opening animation"
          // Scale up slightly to hide any residual thin iframe borders
          // that some platforms render around their player
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          playsInline
          preload="auto"
          muted
        />
      )}

      {/* ── Vignette edges ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0) 0%, rgba(235,225,218,0.7) 100%)'
        }}
      />
      <div 
        className="absolute top-0 inset-x-0 h-20 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(235,225,218,0.8) 0%, rgba(235,225,218,0) 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(235,225,218,0.95) 0%, rgba(235,225,218,0) 100%)'
        }}
      />

      {/* ── IDLE: Welcome splash + Open button ── */}
      {phase === 'idle' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.55) 100%)',
          }}
          onClick={handleClick}
        >
          <div className="space-y-2 pointer-events-none select-none">
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.55em] font-light"
              style={{ color: accentColor, opacity: 0.9 }}
            >
              You Are Cordially Invited
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white drop-shadow-2xl leading-tight"
              style={{ textShadow: `0 0 60px ${accentColor}50, 0 2px 10px rgba(0,0,0,0.9)` }}
            >
              {guestName ? `Welcome, ${guestName}` : coupleNames}
            </h1>
            {guestName && (
              <p className="text-sm sm:text-base font-serif text-white/55 font-light italic">
                {coupleNames}
              </p>
            )}
          </div>

          {/* Pulsing CTA */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <button
              onClick={handleClick}
              className="relative flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}55)`,
                border: `1px solid ${accentColor}60`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 40px ${accentColor}30`,
                animation: 'pulseGlow 2.5s ease-in-out infinite',
              }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${accentColor}40`, animation: 'ringPulse 2.5s ease-out infinite' }}
              />
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Open Your Invitation
            </button>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-light">Tap to reveal</p>
          </div>
        </div>
      )}

      {/* ── PLAYING: Skip button ── */}
      {isPlaying && !isExiting && (
        <button
          onClick={triggerExit}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white/70 border border-white/20 backdrop-blur-md bg-black/30 hover:bg-black/50 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          style={{ animation: 'fadeInDown 0.6s ease 1s both' }}
        >
          Skip
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 40px ${accentColor}30; }
          50%       { box-shadow: 0 0 70px ${accentColor}55, 0 0 20px ${accentColor}40; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);    opacity: 0.6; }
          80%  { transform: scale(1.38); opacity: 0; }
          100% { transform: scale(1.38); opacity: 0; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
