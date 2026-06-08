'use client'

import { useState, useEffect, useRef } from 'react'
import { Invitation } from '@/types/invitation'
import { TEMPLATES } from '@/lib/three/templates'
import { EnvelopeOpeningVideo } from '@/components/invitation/EnvelopeOpeningVideo'
import { CardContent } from '@/components/invitation/CardContent'
import { RSVPForm } from '@/components/invitation/RSVPForm'
import { MusicPlayer } from '@/components/invitation/MusicPlayer'
import { VideoPlayer } from '@/components/invitation/VideoPlayer'
import { IntroVideoScreen } from '@/components/invitation/IntroVideoScreen'
import { PhotoGallery } from '@/components/invitation/PhotoGallery'
import { createClient } from '@/lib/supabase/client'
import { GoogleFontLoader } from '@/components/ui/GoogleFontLoader'

type Stage = 'envelope' | 'video' | 'details'

interface InvitationPageClientProps {
  invitation: Invitation
  guest?: any | null
  initialGuestUploads?: any[]
}

function getPageTheme(templateId: string) {
  const isLight = templateId === 'royalGardenGate' || templateId === 'rosePetal';
  
  let pageBgClass = 'bg-[#080600]';
  let pageBgStyle = '#080600';
  let cardBgStyle = 'rgba(0,0,0,0.5)';
  let cardBorderColor = 'rgba(255,255,255,0.08)';
  let textPrimary = '#ffffff';
  let textSecondary = '#ead8b8'; // parchment-300
  let timerBg = 'rgba(0, 0, 0, 0.4)';
  let timerBorder = 'rgba(255, 255, 255, 0.05)';
  let dividerStyle = 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)';
  
  if (templateId === 'royalGardenGate') {
    // Garden of Eden: Warm Cream theme
    pageBgClass = 'bg-[#f9f5f0]';
    pageBgStyle = '#f9f5f0';
    cardBgStyle = 'rgba(255,255,255,0.85)';
    cardBorderColor = 'rgba(26,50,33,0.12)';
    textPrimary = '#1a3221'; // Deep forest green
    textSecondary = '#4a2e1b'; // Warm taupe
    timerBg = 'rgba(26, 50, 33, 0.05)';
    timerBorder = 'rgba(26, 50, 33, 0.1)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(26, 50, 33, 0.3), transparent)';
  } else if (templateId === 'rosePetal') {
    // Romantic Rose Petal: Blush pink/champagne
    pageBgClass = 'bg-[#fdf8fa]';
    pageBgStyle = '#fdf8fa';
    cardBgStyle = 'rgba(255,255,255,0.85)';
    cardBorderColor = 'rgba(200,144,166,0.2)';
    textPrimary = '#5a2d3a'; // Deep rose/burgundy
    textSecondary = '#70545c'; // Soft mauve
    timerBg = 'rgba(200, 144, 166, 0.05)';
    timerBorder = 'rgba(200, 144, 166, 0.15)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(200, 144, 166, 0.2), transparent)';
  } else if (templateId === 'sinhalaTraditional') {
    pageBgClass = 'bg-[#160105]';
    pageBgStyle = '#160105';
    cardBgStyle = 'rgba(22,1,5,0.65)';
    cardBorderColor = 'rgba(204,163,83,0.3)';
    textPrimary = '#ffffff';
    textSecondary = '#ead8b8';
    timerBg = 'rgba(0, 0, 0, 0.5)';
    timerBorder = 'rgba(204, 163, 83, 0.2)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(204, 163, 83, 0.3), transparent)';
  } else if (templateId === 'royalWax') {
    pageBgClass = 'bg-[#0b0b0f]';
    pageBgStyle = '#0b0b0f';
    cardBgStyle = 'rgba(14,17,26,0.65)';
    cardBorderColor = 'rgba(212,175,55,0.3)';
    textPrimary = '#ffffff';
    textSecondary = '#ead8b8';
    timerBg = 'rgba(0, 0, 0, 0.5)';
    timerBorder = 'rgba(212, 175, 55, 0.2)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)';
  } else if (templateId === 'coupleMonogram') {
    pageBgClass = 'bg-[#090909]';
    pageBgStyle = '#090909';
    cardBgStyle = 'rgba(22,22,22,0.65)';
    cardBorderColor = 'rgba(255,255,255,0.1)';
    textPrimary = '#ffffff';
    textSecondary = '#a3a3a3';
    timerBg = 'rgba(0, 0, 0, 0.5)';
    timerBorder = 'rgba(255, 255, 255, 0.05)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent)';
  } else if (templateId === 'classic') {
    pageBgClass = 'bg-[#0a0005]';
    pageBgStyle = '#0a0005';
    cardBgStyle = 'rgba(0,0,0,0.5)';
    cardBorderColor = 'rgba(201,136,158,0.2)';
    textPrimary = '#ffffff';
    textSecondary = '#f5d0df';
    timerBg = 'rgba(0, 0, 0, 0.5)';
    timerBorder = 'rgba(201, 136, 158, 0.15)';
    dividerStyle = 'linear-gradient(to right, transparent, rgba(201, 136, 158, 0.25), transparent)';
  }
  
  return {
    isLight,
    pageBgClass,
    pageBgStyle,
    cardBgStyle,
    cardBorderColor,
    textPrimary,
    textSecondary,
    timerBg,
    timerBorder,
    dividerStyle
  }
}

export function InvitationPageClient({ invitation, guest, initialGuestUploads = [] }: InvitationPageClientProps) {
  const [stage, setStage] = useState<Stage>('envelope')
  const [startIntro, setStartIntro] = useState(false)
  const [envelopeMounted, setEnvelopeMounted] = useState(true)
  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [uploadName, setUploadName] = useState(guest?.name ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [guestPhotos, setGuestPhotos] = useState<any[]>(initialGuestUploads)

  const builderConfig = invitation.builder_config
  const openConfig = builderConfig?.sections.find(s => s.type === 'open')
  const introConfig = builderConfig?.sections.find(s => s.type === 'intro')
  const detailsConfig = builderConfig?.sections.find(s => s.type === 'details')
  const galleryConfig = builderConfig?.sections.find(s => s.type === 'gallery')
  const rsvpConfig = builderConfig?.sections.find(s => s.type === 'rsvp')
  const footerConfig = builderConfig?.sections.find(s => s.type === 'footer')

  const activeFonts = builderConfig ? [
    builderConfig.global.primaryFont,
    builderConfig.global.secondaryFont,
    ...builderConfig.sections.map(s => s.styles.fontFamily)
  ].filter(Boolean) as string[] : []

  const template = builderConfig ? {
    id: invitation.template_id,
    name: 'Custom Theme',
    accentColor: builderConfig.global.accentColor || '#D4AF37',
    textColor: builderConfig.global.primaryColor || '#ffffff',
    fontFamily: builderConfig.global.primaryFont || 'Playfair Display',
    previewGradient: ''
  } : (TEMPLATES[invitation.template_id] ?? TEMPLATES.classic)

  const coupleName = `${invitation.partner1_name} & ${invitation.partner2_name}`
  const supabase = createClient()

  // Called 1.5s before envelope video ends (or immediately when skipped)
  const handleEnvelopeFadeOutStart = () => {
    if (invitation.video_url) {
      // Start the title video exactly 1.0 second before envelope unmounts
      setTimeout(() => {
        setStartIntro(true)
      }, 500)
    }
  }

  // When envelope opens: if there is an intro video, go to video stage; otherwise go straight to details
  const handleEnvelopeOpen = () => {
    setEnvelopeMounted(false)
    if (invitation.video_url) {
      setStage('video')
      setStartIntro(true)
    } else {
      setStage('details')
    }
  }

  // When intro video ends / user skips: transition to details
  const handleVideoComplete = () => {
    setStage('details')
    // Smooth scroll to details after a moment
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 600)
  }

  const envelopeOpened = stage !== 'envelope'

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Handle guest photo upload
  const handleGuestPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!uploadName.trim()) {
      setUploadError('Please enter your name first')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 10)
      const filePath = `${invitation.id}/guest-uploads/${randomId}.${fileExt}`

      const { error: uploadErr } = await supabase.storage
        .from('wedding-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-assets')
        .getPublicUrl(filePath)

      // Post to database via API
      const res = await fetch('/api/guest-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: invitation.id,
          url: publicUrl,
          fileType: file.type.startsWith('video/') ? 'video' : 'image',
          guestName: uploadName,
        })
      })

      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error ?? 'Failed to register photo')

      setUploadSuccess('Upload successful! Your photo will appear once moderated by the couple.')
      if (!guest?.name) {
        setUploadName('')
      }
    } catch (err: any) {
      console.error('[Guest Upload Error]:', err)
      setUploadError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Render maps helper
  const renderMapsEmbed = (embedCode: string) => {
    if (!embedCode) return null
    
    // Check if it is an iframe or just a URL
    if (embedCode.includes('<iframe')) {
      // Extract src
      const match = embedCode.match(/src="([^"]+)"/)
      const src = match ? match[1] : ''
      if (src) {
        return (
          <iframe
            src={src}
            className="w-full h-64 rounded-sm border border-white/10"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )
      }
    }

    // Treat as direct link / embed url
    return (
      <iframe
        src={embedCode}
        className="w-full h-64 rounded-sm border border-white/10"
        allowFullScreen
        loading="lazy"
      />
    )
  }

  const pageTheme = builderConfig ? {
    isLight: false,
    pageBgClass: '',
    pageBgStyle: detailsConfig?.styles.bgColor || '#0b0b0f',
    cardBgStyle: 'rgba(15, 23, 42, 0.45)',
    cardBorderColor: detailsConfig?.styles.textColor ? `${detailsConfig.styles.textColor}22` : 'rgba(255,255,255,0.08)',
    textPrimary: detailsConfig?.styles.titleColor || detailsConfig?.styles.textColor || builderConfig.global.primaryColor || '#ffffff',
    textSecondary: detailsConfig?.styles.textColor || builderConfig.global.primaryColor || '#ffffff',
    timerBg: 'rgba(0, 0, 0, 0.45)',
    timerBorder: 'rgba(255, 255, 255, 0.05)',
    dividerStyle: `linear-gradient(to right, transparent, ${builderConfig.global.accentColor || '#D4AF37'}, transparent)`,
  } : getPageTheme(invitation.template_id)

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden ${pageTheme.pageBgClass} ${pageTheme.isLight ? (invitation.template_id === 'royalGardenGate' ? 'theme-light-garden' : 'theme-light-rose') : ''}`}
      style={{
        backgroundColor: builderConfig?.global.bgColor || pageTheme.pageBgStyle,
        backgroundImage: builderConfig && builderConfig.global.bgType === 'image' && builderConfig.global.bgUrl ? `url(${builderConfig.global.bgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {builderConfig && <GoogleFontLoader fonts={activeFonts} />}
      
      {builderConfig && (
        <style>{`
          .custom-font-primary {
            font-family: '${builderConfig.global.primaryFont || 'Playfair Display'}', serif !important;
          }
          .custom-font-secondary {
            font-family: '${builderConfig.global.secondaryFont || 'Montserrat'}', sans-serif !important;
          }
          .custom-font-open {
            font-family: '${openConfig?.styles.fontFamily || builderConfig.global.primaryFont || 'Great Vibes'}', serif !important;
          }
          .custom-font-details {
            font-family: '${detailsConfig?.styles.fontFamily || builderConfig.global.primaryFont || 'Playfair Display'}', serif !important;
          }
          .custom-font-gallery {
            font-family: '${galleryConfig?.styles.fontFamily || builderConfig.global.primaryFont || 'Playfair Display'}', serif !important;
          }
          .custom-font-rsvp {
            font-family: '${rsvpConfig?.styles.fontFamily || builderConfig.global.primaryFont || 'Playfair Display'}', serif !important;
          }
          .custom-font-footer {
            font-family: '${footerConfig?.styles.fontFamily || builderConfig.global.secondaryFont || 'Montserrat'}', sans-serif !important;
          }
        `}</style>
      )}

      {/* ═══════════════════════════════════════════
          STAGE 1 & 2: OPENING & CINEMATIC INTRO VIDEOS (with 1.5s cross-fade transition)
      ═══════════════════════════════════════════ */}
      
      {/* ── Intro Video (mounts 1.0s before envelope ends, stays mounted for stage === 'video') ── */}
      {(startIntro || stage === 'video') && (introConfig?.styles.bgUrl || invitation.video_url) && (
        <IntroVideoScreen
          videoUrl={introConfig?.styles.bgUrl || invitation.video_url || ''}
          coupleNames={coupleName}
          accentColor={template.accentColor}
          onComplete={handleVideoComplete}
          hideOverlay={introConfig?.content.hideOverlay || false}
          titleOverride={introConfig?.content.title}
          subtitleOverride={introConfig?.content.subtitle}
          fontFamilyOverride={introConfig?.styles.fontFamily}
          titleColorOverride={introConfig?.styles.titleColor}
          subtitleColorOverride={introConfig?.styles.subtitleColor}
          textColorOverride={introConfig?.styles.textColor}
          overlayY={introConfig?.styles.overlayY}
        />
      )}

      {/* ── Envelope Opening Video (renders on top of intro video, fades out) ── */}
      {envelopeMounted && stage === 'envelope' && (
        (openConfig?.styles.bgUrl || invitation.cover_url) ? (
          <EnvelopeOpeningVideo
            videoUrl={openConfig?.styles.bgUrl || invitation.cover_url || ''}
            coupleNames={coupleName}
            guestName={guest?.name}
            accentColor={template.accentColor}
            onOpen={handleEnvelopeOpen}
            onFadeOutStart={handleEnvelopeFadeOutStart}
            titleOverride={openConfig?.content.title}
            subtitleOverride={openConfig?.content.subtitle}
            buttonTextOverride={openConfig?.content.buttonText}
            textColorOverride={openConfig?.styles.textColor}
            fontFamilyOverride={openConfig?.styles.fontFamily}
            hideOverlay={openConfig?.content.hideOverlay || false}
            overlayY={openConfig?.styles.overlayY}
          />
        ) : (
          /* ─── Fallback: no cover video — static fullscreen splash ─── */
          <div
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black px-6 text-center"
            onClick={handleEnvelopeOpen}
            style={{ cursor: 'pointer' }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, ${template.accentColor}18 0%, black 70%)`,
              }}
            />
            <div className="relative z-10 space-y-6 max-w-lg">
              <p
                className="text-[10px] sm:text-xs uppercase tracking-[0.55em] font-light"
                style={{ color: template.accentColor }}
              >
                You Are Cordially Invited
              </p>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight"
                style={{ textShadow: `0 0 80px ${template.accentColor}40, 0 2px 10px rgba(0,0,0,0.9)` }}
              >
                {guest ? `Welcome, ${guest.name}` : coupleName}
              </h1>
              {guest && (
                <p className="font-serif text-lg text-white/50 font-light italic">{coupleName}</p>
              )}
              {/* CTA */}
              <button
                onClick={handleEnvelopeOpen}
                className="mt-6 px-8 py-4 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${template.accentColor}44, ${template.accentColor}66)`,
                  border: `1px solid ${template.accentColor}60`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: `0 0 40px ${template.accentColor}35`,
                }}
              >
                Open Invitation
              </button>
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-light">Tap anywhere to open</p>
            </div>
          </div>
        )
      )}

      {/* ═══════════════════════════════════════════
          STAGE 3: WEDDING DETAILS — scroll into view
      ═══════════════════════════════════════════ */}
      {stage === 'details' && (
        <div
          ref={detailsRef}
          className="relative w-full"
          style={{
            animation: 'detailsFadeIn 0.8s ease forwards',
          }}
        >
          {/* Hero title banner at top of details */}
          <div
            className="w-full py-20 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${pageTheme.pageBgStyle}, transparent)`,
              minHeight: '40vh',
              paddingTop: detailsConfig?.styles.paddingTop ? `${detailsConfig.styles.paddingTop}px` : undefined,
              paddingBottom: detailsConfig?.styles.paddingBottom ? `${detailsConfig.styles.paddingBottom}px` : undefined,
            }}
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-30"
                  style={{
                    background: template.accentColor,
                    left: `${8 + i * 8}%`,
                    top: `${10 + (i % 4) * 22}%`,
                    animation: `float ${3 + i * 0.3}s ease-in-out ${i * 0.4}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.55em] mb-4 font-light custom-font-secondary"
              style={{ color: detailsConfig?.styles.subtitleColor || detailsConfig?.styles.textColor || template.accentColor }}
            >
              {detailsConfig?.content.subtitle || 'Together With Their Families'}
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight custom-font-details"
              style={{
                color: detailsConfig?.styles.titleColor || detailsConfig?.styles.textColor || pageTheme.textPrimary,
                textShadow: pageTheme.isLight
                  ? 'none'
                  : `0 0 80px ${template.accentColor}30, 0 2px 10px rgba(0,0,0,0.5)`,
              }}
            >
              {coupleName}
            </h1>
            <div
              className="h-px w-24 mx-auto mt-6"
              style={{ background: `linear-gradient(to right, transparent, ${detailsConfig?.styles.subtitleColor || template.accentColor}, transparent)` }}
            />
            <p
              className="mt-4 text-sm font-light tracking-widest uppercase custom-font-secondary"
              style={{ color: detailsConfig?.styles.textColor || pageTheme.textSecondary, opacity: 0.7 }}
            >
              {detailsConfig?.content.title || 'Wedding Invitation'}
            </p>
            {/* Scroll cue */}
            <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
              <p className="text-[10px] uppercase tracking-widest custom-font-secondary" style={{ color: detailsConfig?.styles.subtitleColor || detailsConfig?.styles.textColor || template.accentColor, opacity: 0.6 }}>
                Scroll to explore
              </p>
              <svg className="w-4 h-4" style={{ color: detailsConfig?.styles.subtitleColor || detailsConfig?.styles.textColor || template.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Floating Music Player */}
      {invitation.music_url && (
        <MusicPlayer url={invitation.music_url} autoPlayTrigger={envelopeOpened} />
      )}

      {/* Floating WhatsApp Button */}
      {invitation.whatsapp_number && (
        <a
          href={`https://wa.me/${invitation.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%2C%20celebrating%20with%20you%20on%20your%20wedding!`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50 p-3.5 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-115 active:scale-95 transition-all duration-200"
          title="Chat with us on WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* ═══════════════════════════════════════════
          CARD CONTENT — only visible in details stage
      ═══════════════════════════════════════════ */}
      {stage === 'details' && (
      <>
      <div
        className="relative px-6"
        style={{
          backgroundColor: !builderConfig 
            ? undefined 
            : ((builderConfig.global.bgType === 'image' || builderConfig.global.bgColor) 
                ? 'transparent' 
                : (detailsConfig?.styles.bgColor || '#0b0b0f')),
          backgroundImage: builderConfig && detailsConfig?.styles.bgType === 'image' && detailsConfig.styles.bgUrl ? `url(${detailsConfig.styles.bgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: detailsConfig?.styles.paddingTop ? `${detailsConfig.styles.paddingTop}px` : '4rem',
          paddingBottom: detailsConfig?.styles.paddingBottom ? `${detailsConfig.styles.paddingBottom}px` : '4rem',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* If background is video */}
        {builderConfig && detailsConfig?.styles.bgType === 'video' && detailsConfig.styles.bgUrl && (
          <video
            src={detailsConfig.styles.bgUrl}
            className="absolute inset-0 object-cover w-full h-full pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        
        {/* Background overlay */}
        {builderConfig && detailsConfig?.styles.bgOverlayOpacity !== undefined && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: detailsConfig.styles.bgOverlayColor || '#000000',
              opacity: detailsConfig.styles.bgOverlayOpacity / 100
            }}
          />
        )}

        {/* Floating particles background (legacy only) */}
        {!builderConfig && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full opacity-20 animate-float"
                style={{
                  background: template.accentColor,
                  left: `${10 + i * 11}%`,
                  top: `${5 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${3 + i * 0.4}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto relative space-y-16">
          {/* 1. Wedding details card */}
          <div
            className="p-8 md:p-12 border shadow-2xl transition-all"
            style={{
              background: pageTheme.cardBgStyle,
              backdropFilter: 'blur(20px)',
              borderColor: pageTheme.cardBorderColor,
              borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
              boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
            }}
          >
            <CardContent invitation={invitation} visible theme={pageTheme} />
          </div>

          {/* 2. Bride & Groom Profiles */}
          {(invitation.bride_full_name || invitation.groom_full_name) && (
            <div
              className="p-8 md:p-12 border shadow-2xl space-y-8 transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Meet the Couple</p>
                <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Groom & Bride</h3>
                <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Groom Card */}
                {invitation.groom_full_name && (
                  <div className="text-center space-y-4 flex flex-col items-center">
                    {invitation.groom_photo_url ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 shadow-md bg-black/20" style={{ borderColor: template.accentColor }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={invitation.groom_photo_url} alt="Groom" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full flex items-center justify-center border border-dashed text-4xl bg-white/5" style={{ borderColor: template.accentColor }}>
                        🤵
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif text-lg font-bold" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>{invitation.groom_full_name}</h4>
                      <p className="text-xs opacity-75 mt-0.5" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>The Groom</p>
                      {invitation.groom_parents && (
                        <p className="text-[11px] mt-1 italic" style={{ color: detailsConfig?.styles.textColor || '#ead8b8', opacity: 0.8 }}>Son of {invitation.groom_parents}</p>
                      )}
                    </div>
                    {invitation.groom_bio && (
                      <p className="text-xs leading-relaxed font-light line-clamp-4" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.groom_bio}</p>
                    )}
                  </div>
                )}

                {/* Bride Card */}
                {invitation.bride_full_name && (
                  <div className="text-center space-y-4 flex flex-col items-center">
                    {invitation.bride_photo_url ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 shadow-md bg-black/20" style={{ borderColor: template.accentColor }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={invitation.bride_photo_url} alt="Bride" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full flex items-center justify-center border border-dashed text-4xl bg-white/5" style={{ borderColor: template.accentColor }}>
                        👰
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif text-lg font-bold" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>{invitation.bride_full_name}</h4>
                      <p className="text-xs opacity-75 mt-0.5" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>The Bride</p>
                      {invitation.bride_parents && (
                        <p className="text-[11px] mt-1 italic" style={{ color: detailsConfig?.styles.textColor || '#ead8b8', opacity: 0.8 }}>Daughter of {invitation.bride_parents}</p>
                      )}
                    </div>
                    {invitation.bride_bio && (
                      <p className="text-xs leading-relaxed font-light line-clamp-4" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.bride_bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Timeline / Story Journey */}
          {invitation.timeline_events && invitation.timeline_events.length > 0 && (
            <div
              className="p-8 md:p-12 border shadow-2xl space-y-8 transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Our Journey</p>
                <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Love Story</h3>
                <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
              </div>

              <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8">
                {invitation.timeline_events.map((event, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline bullet dot */}
                    <div
                      className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-black transition-all group-hover:scale-125"
                      style={{ borderColor: detailsConfig?.styles.subtitleColor || template.accentColor }}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="font-serif text-base font-bold" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>{event.title}</h4>
                        {event.date && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm" style={{ color: detailsConfig?.styles.subtitleColor || '#ead8b8' }}>
                            {event.date}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-light leading-relaxed" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{event.description}</p>
                      {event.photo_url && (
                        <div className="w-full max-w-[240px] aspect-[4/3] rounded-sm overflow-hidden border border-white/10 mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={event.photo_url} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Event Information & Maps */}
          <div
            className="p-8 md:p-12 border shadow-2xl space-y-8 transition-all"
            style={{
              background: pageTheme.cardBgStyle,
              backdropFilter: 'blur(20px)',
              borderColor: pageTheme.cardBorderColor,
              borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
              boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
            }}
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Join Us For</p>
              <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Event Information</h3>
              <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-sm text-parchment-400">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Date & Time</h4>
                  <p className="text-base font-semibold" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>{formatDate(invitation.wedding_date)}</p>
                  <p className="text-sm" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>Ceremony: <span style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>{invitation.wedding_time}</span></p>
                  {invitation.reception_time && (
                    <p className="text-sm" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>Reception: <span style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>{invitation.reception_time}</span></p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Location</h4>
                  <p className="text-base font-semibold" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>{invitation.venue_name}</p>
                  {invitation.venue_address && <p className="text-sm" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.venue_address}</p>}
                </div>

                {invitation.dress_code && (
                  <div>
                    <h4 className="font-medium text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Dress Code</h4>
                    <p className="text-sm italic" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>{invitation.dress_code}</p>
                  </div>
                )}

                {invitation.additional_instructions && (
                  <div>
                    <h4 className="font-medium text-xs uppercase tracking-wider mb-1 opacity-70" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Note</h4>
                    <p className="text-xs leading-relaxed font-light" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.additional_instructions}</p>
                  </div>
                )}
              </div>

              {/* Maps embed */}
              {invitation.google_maps_embed_url && (
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="overflow-hidden rounded-sm border border-white/10 bg-black/10">
                    {renderMapsEmbed(invitation.google_maps_embed_url)}
                  </div>
                  {/* Clean Navigation Link */}
                  <a
                    href={
                      invitation.google_maps_embed_url.includes('https://') && !invitation.google_maps_embed_url.includes('<iframe')
                        ? invitation.google_maps_embed_url
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue_name + ' ' + (invitation.venue_address ?? ''))}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 border rounded-sm text-xs font-semibold text-white transition-all hover:bg-white/10"
                    style={{ borderColor: template.accentColor }}
                  >
                    🗺️ Open in Google Maps / Navigate
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 5. Invitation Video Player */}
          {invitation.video_url && (
            <div
              className="p-8 md:p-10 border shadow-2xl transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <VideoPlayer url={invitation.video_url} accentColor={template.accentColor} />
            </div>
          )}

          {/* 6. Photo Gallery Carousel */}
          {invitation.gallery_urls && invitation.gallery_urls.length > 0 && (
            <div
              className="p-8 md:p-10 border shadow-2xl transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <PhotoGallery urls={invitation.gallery_urls} accentColor={template.accentColor} />
            </div>
          )}

          {/* 7. Gift Registry Accordion/Card */}
          {(invitation.registry_bank_details || invitation.registry_preferences || invitation.registry_qr_url) && (
            <div
              className="p-8 md:p-12 border shadow-2xl space-y-6 text-sm transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Registry</p>
                <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Gift Registry</h3>
                <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  {invitation.registry_bank_details && (
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs uppercase tracking-wider opacity-75" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Bank Account Details</h4>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm font-mono text-xs text-parchment-300 relative group">
                        <p className="whitespace-pre-wrap" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.registry_bank_details}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(invitation.registry_bank_details ?? '')
                            alert('Copied to clipboard!')
                          }}
                          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-[10px] text-white px-2 py-1 rounded cursor-pointer transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {invitation.registry_preferences && (
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs uppercase tracking-wider opacity-75" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Gift Preferences</h4>
                      <p className="text-xs leading-relaxed font-light" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>{invitation.registry_preferences}</p>
                    </div>
                  )}

                  {invitation.registry_online_contributions && (
                    <div className="p-4 border border-rose-500/20 bg-rose-950/10 rounded-sm">
                      <p className="text-xs text-rose-300 font-medium">Online contributions active</p>
                      <p className="text-[10px] text-parchment-500 mt-1">If you would like to contribute towards our new life together, we thank you heartily.</p>
                    </div>
                  )}
                </div>

                {/* QR payment Code */}
                {invitation.registry_qr_url && (
                  <div className="flex flex-col items-center space-y-2 border border-white/5 bg-black/20 p-4 rounded-sm">
                    <h4 className="font-medium text-xs uppercase tracking-wider opacity-75" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Scan to Gift</h4>
                    <div className="w-40 h-40 border border-white/10 rounded-sm overflow-hidden bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={invitation.registry_qr_url} alt="Registry Payment QR" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[10px] font-light" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>Scan using any local bank app</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. Live Stream Card */}
          {invitation.live_stream_active && invitation.live_stream_url && (
            <div
              className="p-8 border shadow-2xl text-center space-y-4 transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-900/40 border border-red-700/40 text-red-400 text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Live Broadcast
              </div>
              <h3 className="text-xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Watch Wedding Live</h3>
              <p className="text-xs max-w-sm mx-auto font-light" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>
                For friends and family who are joining us remotely, watch our live stream ceremony broadcasted via {invitation.live_stream_platform ?? 'YouTube'}.
              </p>
              <a
                href={invitation.live_stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-sm text-sm font-semibold transition-all hover:shadow-lg"
              >
                📹 Join Live Stream on {invitation.live_stream_platform?.toUpperCase() ?? 'STREAM'}
              </a>
            </div>
          )}

          {/* 9. Contact Section */}
          {(invitation.bride_contact || invitation.groom_contact || invitation.family_contact) && (
            <div
              className="p-8 md:p-12 border shadow-2xl space-y-6 transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Get in Touch</p>
                <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Contact Organizers</h3>
                <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
              </div>

              <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-parchment-400">
                {invitation.bride_contact && (
                  <div className="text-center">
                    <p className="text-xs opacity-60" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>Bride Details</p>
                    <a href={`tel:${invitation.bride_contact}`} className="text-base hover:underline mt-1 block" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>
                      📞 {invitation.bride_contact}
                    </a>
                  </div>
                )}

                {invitation.groom_contact && (
                  <div className="text-center">
                    <p className="text-xs opacity-60" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>Groom Details</p>
                    <a href={`tel:${invitation.groom_contact}`} className="text-base hover:underline mt-1 block" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>
                      📞 {invitation.groom_contact}
                    </a>
                  </div>
                )}

                {invitation.family_contact && (
                  <div className="text-center">
                    <p className="text-xs opacity-60" style={{ color: detailsConfig?.styles.textColor || '#ffffff' }}>Family Contact</p>
                    <a href={`tel:${invitation.family_contact}`} className="text-base hover:underline mt-1 block" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>
                      📞 {invitation.family_contact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 10. Photo Upload Moderation System (Guest Wall) */}
          {(invitation.package === 'luxury' || (invitation as any).package === 'premium') && (
            <div
              className="p-8 md:p-12 border shadow-2xl space-y-8 transition-all"
              style={{
                background: pageTheme.cardBgStyle,
                backdropFilter: 'blur(20px)',
                borderColor: pageTheme.cardBorderColor,
                borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
                boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
              }}
            >
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] mb-1" style={{ color: detailsConfig?.styles.subtitleColor || template.accentColor }}>Share Memories</p>
                <h3 className="text-2xl font-serif font-medium" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Guest Photo Wall</h3>
                <div className="h-px w-16 bg-white/20 mx-auto mt-3" />
              </div>

              {/* Upload Form */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-sm space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: detailsConfig?.styles.titleColor || '#ffffff' }}>Upload a photo or selfie</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <label className="text-xs" style={{ color: detailsConfig?.styles.textColor || '#ead8b8' }}>Your Name (to display under photo)</label>
                    <input
                      type="text"
                      placeholder="e.g. Nimal Perera"
                      value={uploadName}
                      onChange={e => setUploadName(e.target.value)}
                      disabled={!!guest?.name}
                      className="px-3 py-2 bg-black/40 border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-rose-400 placeholder:text-parchment-700"
                    />
                  </div>

                  {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                  {uploadSuccess && <p className="text-xs text-green-400">{uploadSuccess}</p>}

                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="guest-photo-upload"
                      className="hidden"
                      onChange={handleGuestPhotoUpload}
                      disabled={uploading || !uploadName.trim()}
                    />
                    <label
                      htmlFor="guest-photo-upload"
                      className={`px-4 py-2 border rounded-sm text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                        uploading || !uploadName.trim()
                          ? 'border-white/10 text-parchment-700 cursor-not-allowed'
                          : 'border-white/20 hover:bg-white/10 text-white'
                      }`}
                      style={!uploading && uploadName.trim() ? { borderColor: detailsConfig?.styles.subtitleColor || template.accentColor, color: detailsConfig?.styles.subtitleColor || template.accentColor } : {}}
                    >
                      {uploading ? '⏳ Uploading...' : '📷 Select & Upload Photo'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Moderated Grid Display */}
              {guestPhotos.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Photos Shared by Guests</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {guestPhotos.map(photo => (
                      <div key={photo.id} className="relative aspect-square rounded-sm overflow-hidden border border-white/10 group bg-black/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt={`Shared by ${photo.guest_name}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left pointer-events-none">
                          <p className="text-[10px] text-white font-medium truncate">{photo.guest_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-parchment-600 text-xs">
                  No guest photos uploaded yet. Be the first to share!
                </div>
              )}
            </div>
          )}

          {/* 11. RSVP Form */}
          <div
            className="p-8 md:p-10 border shadow-2xl transition-all"
            style={{
              background: pageTheme.cardBgStyle,
              backdropFilter: 'blur(20px)',
              borderColor: pageTheme.cardBorderColor,
              borderRadius: detailsConfig?.styles.borderRadius ? `${detailsConfig.styles.borderRadius}px` : '4px',
              boxShadow: detailsConfig?.styles.boxShadow ? '0 10px 40px rgba(0,0,0,0.5)' : undefined
            }}
          >
            <RSVPForm
              invitationId={invitation.id}
              coupleName={coupleName}
              accentColor={template.accentColor}
              textColor={pageTheme.textPrimary}
              guestId={guest?.id}
              guestName={guest?.name}
              guestPhone={guest?.phone}
              guestEmail={guest?.email}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4 border-t border-white/5">
        <a
          href="/"
          className="text-xs hover:text-parchment-500 transition-colors"
          style={{ color: footerConfig?.styles.textColor || detailsConfig?.styles.textColor || '#ead8b8' }}
        >
          Powered by 💍 WeddingLK · Create your own 3D invitation
        </a>
      </div>
      </>
      )}
    </div>
  )
}
