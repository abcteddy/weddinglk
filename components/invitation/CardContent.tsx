'use client'

import { useState, useEffect } from 'react'
import { Invitation } from '@/types/invitation'
import { formatWeddingDate, getDaysUntil } from '@/lib/utils/slug'
import { TEMPLATES } from '@/lib/templates'
import { getOptimizedImageUrl } from '@/lib/utils/image'

interface CardContentProps {
  invitation: Invitation
  visible?: boolean
  theme: {
    isLight: boolean
    pageBgClass: string
    pageBgStyle: string
    cardBgStyle: string
    cardBorderColor: string
    textPrimary: string
    textSecondary: string
    timerBg: string
    timerBorder: string
    dividerStyle: string
  }
}

function Countdown({ 
  targetDate, 
  targetTime = '6:00 PM', 
  theme 
}: { 
  targetDate: string; 
  targetTime?: string; 
  theme: any 
}) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    setMounted(true)

    function calculateTimeLeft() {
      if (!targetDate) return null

      // Parse time to 24h format robustly
      const convertTimeTo24h = (timeStr: string) => {
        try {
          if (!timeStr) return '18:00:00'
          const cleanStr = timeStr.trim().toUpperCase()
          
          // Match standard formats: e.g. "6:30 PM", "18:00", "6 PM", "06:00 AM", etc.
          const match = cleanStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/)
          if (!match) {
            const numMatch = cleanStr.match(/(\d{1,2}):(\d{2})/)
            if (numMatch) {
              return `${numMatch[1].padStart(2, '0')}:${numMatch[2].padStart(2, '0')}:00`
            }
            return '18:00:00'
          }
          
          let hours = parseInt(match[1], 10)
          const minutes = match[2] ? match[2] : '00'
          const ampm = match[3]
          
          if (ampm) {
            if (ampm === 'PM' && hours < 12) {
              hours += 12
            } else if (ampm === 'AM' && hours === 12) {
              hours = 0
            }
          }
          return `${String(hours).padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
        } catch (e) {
          return '18:00:00'
        }
      }

      // Extract date parts manually to avoid browser string-parsing discrepancies
      const dateParts = targetDate.split('-')
      if (dateParts.length !== 3) {
        const slashParts = targetDate.split('/')
        if (slashParts.length === 3) {
          if (slashParts[0].length === 4) {
            dateParts.push(slashParts[0], slashParts[1], slashParts[2])
          } else {
            dateParts.push(slashParts[2], slashParts[0], slashParts[1])
          }
        } else {
          return null
        }
      }

      const year = parseInt(dateParts[0], 10)
      const month = parseInt(dateParts[1], 10) - 1 // JS months are 0-indexed
      const day = parseInt(dateParts[2], 10)

      const time24h = convertTimeTo24h(targetTime)
      const [hours, minutes, seconds] = time24h.split(':').map(x => parseInt(x, 10))

      const targetUtc = new Date(year, month, day, hours, minutes, seconds)
      
      if (isNaN(targetUtc.getTime())) {
        return null
      }

      const difference = targetUtc.getTime() - Date.now()
      
      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, targetTime])

  // Don't render anything if targetDate is not set
  if (!targetDate) return null

  // Prevent layout shift and hydration mismatches during server rendering
  if (!mounted) {
    return <div className="h-24" />
  }

  if (!timeLeft) return (
    <div className="text-center mt-4">
      <span className="text-2xl font-serif" style={{ color: 'var(--accent)' }}>Today is the day! 🎉</span>
    </div>
  )

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs uppercase tracking-widest opacity-60" style={{ color: theme.textSecondary }}>Wedding Starts In</p>
      <div className="flex items-center justify-center gap-3">
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hours' },
          { val: timeLeft.minutes, label: 'Minutes' },
          { val: timeLeft.seconds, label: 'Seconds' },
        ].map(({ val, label }) => (
          <div 
            key={label} 
            className="flex flex-col items-center min-w-[64px] p-2.5 border rounded-sm backdrop-blur-sm transition-all"
            style={{ 
              backgroundColor: theme.timerBg, 
              borderColor: theme.timerBorder 
            }}
          >
            <span className="text-2xl md:text-3xl font-bold font-serif" style={{ color: 'var(--accent)' }}>
              {String(val).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70" style={{ color: theme.textSecondary }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


export function CardContent({ invitation, visible = true, theme }: CardContentProps) {
  const template = TEMPLATES[invitation.template_id] ?? TEMPLATES.classic

  if (!visible) return null

  const formattedDate = formatWeddingDate(invitation.wedding_date)

  return (
    <div
      className="w-full text-center animate-fade-up"
      style={{
        fontFamily: template.fontFamily,
        '--accent': template.accentColor,
        '--text': theme.textPrimary,
      } as React.CSSProperties}
    >
      {/* Cover Image */}
      {invitation.photo_url && (
        <div
          className="w-full aspect-[16/9] mb-8 rounded-sm overflow-hidden border shadow-lg bg-black/25"
          style={{ borderColor: template.accentColor + '20' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getOptimizedImageUrl(invitation.photo_url, { width: 800 })}
            alt="Couple Cover Photo"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>
      )}

      {/* Decorative top */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px flex-1 opacity-30" style={{ background: template.accentColor }} />
        <span className="text-xl" style={{ color: template.accentColor }}>✦</span>
        <div className="h-px flex-1 opacity-30" style={{ background: template.accentColor }} />
      </div>

      {/* Together Forever */}
      <p className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: template.accentColor, opacity: 0.8 }}>
        Together Forever
      </p>

      {/* Names */}
      <div className="mb-2">
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight font-serif"
          style={{ color: theme.textPrimary }}
        >
          {invitation.partner1_name}
        </h1>
        <p className="text-2xl my-2 italic" style={{ color: template.accentColor }}>
          &amp;
        </p>
        <h2
          className="text-5xl md:text-6xl font-bold leading-tight font-serif"
          style={{ color: theme.textPrimary }}
        >
          {invitation.partner2_name}
        </h2>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="h-px w-16 opacity-40" style={{ background: template.accentColor }} />
        <span className="text-sm" style={{ color: template.accentColor }}>✦</span>
        <div className="h-px w-16 opacity-40" style={{ background: template.accentColor }} />
      </div>

      {/* Date & Venue */}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1" style={{ color: theme.textSecondary }}>
            Date & Time
          </p>
          <p className="text-xl font-bold font-serif" style={{ color: theme.textPrimary }}>
            {formattedDate}
          </p>
          <p className="text-lg font-medium" style={{ color: template.accentColor }}>
            {invitation.wedding_time}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1" style={{ color: theme.textSecondary }}>
            Venue
          </p>
          <p className="text-xl font-semibold font-serif" style={{ color: theme.textPrimary }}>
            {invitation.venue_name}
          </p>
          {invitation.venue_address && (
            <p className="text-sm opacity-80 mt-1" style={{ color: theme.textSecondary }}>
              {invitation.venue_address}
            </p>
          )}
        </div>
      </div>

      {/* Custom message */}
      {invitation.custom_message && (
        <div className="mt-6 px-6">
          <p className="text-sm italic opacity-85 leading-relaxed" style={{ color: theme.textSecondary }}>
            &ldquo;{invitation.custom_message}&rdquo;
          </p>
        </div>
      )}

      {/* Countdown */}
      <Countdown targetDate={invitation.wedding_date} targetTime={invitation.wedding_time ?? '6:00 PM'} theme={theme} />

      {/* RSVP deadline */}
      {invitation.rsvp_deadline && (
        <p className="text-xs mt-6 opacity-60" style={{ color: theme.textSecondary }}>
          Kindly RSVP by {formatWeddingDate(invitation.rsvp_deadline)}
        </p>
      )}

      {/* Bottom decoration */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="h-px flex-1 opacity-30" style={{ background: template.accentColor }} />
        <span className="text-xl" style={{ color: template.accentColor }}>✦</span>
        <div className="h-px flex-1 opacity-30" style={{ background: template.accentColor }} />
      </div>
    </div>
  )
}
