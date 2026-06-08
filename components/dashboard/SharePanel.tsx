'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface SharePanelProps {
  slug: string
  coupleName: string
  isPublished: boolean
}

export function SharePanel({ slug, coupleName, isPublished }: SharePanelProps) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://weddinglk.com'
  const url = `${baseUrl}/inv/${slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const whatsappMsg = encodeURIComponent(
    `💍 You're invited to ${coupleName}'s wedding!\n\nClick here to view your 3D invitation and RSVP:\n${url}`,
  )

  const shareButtons = [
    {
      id: 'share-whatsapp',
      label: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${whatsappMsg}`,
      color: '#25D366',
    },
    {
      id: 'share-facebook',
      label: 'Facebook',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: '#1877F2',
    },
  ]

  if (!isPublished) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-sm p-6">
        <h2 className="text-base font-medium text-white mb-3">Share Invitation</h2>
        <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-700/30 rounded-sm px-4 py-3">
          <span className="text-amber-400 text-lg">⚠️</span>
          <p className="text-sm text-amber-300">
            Your invitation is not published yet. Complete payment to activate and share your invitation.
          </p>
        </div>
        <Button variant="gold" size="lg" className="mt-4 w-full" id="publish-btn"
          onClick={() => window.location.href = '/dashboard?tab=payment'}>
          Activate Invitation
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm p-6">
      <h2 className="text-base font-medium text-white mb-4">Share Invitation</h2>

      {/* URL copy */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-sm text-parchment-400 truncate">
          {url}
        </div>
        <Button
          id="copy-link-btn"
          variant="secondary"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <><span>✓</span> Copied!</>
          ) : (
            <><span>📋</span> Copy</>
          )}
        </Button>
      </div>

      {/* View invitation link */}
      <a
        href={`/inv/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        id="view-invitation-link"
        className="flex items-center justify-center gap-2 w-full py-2.5 mb-4 border border-white/15 rounded-sm text-sm text-parchment-300 hover:text-white hover:border-white/30 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Preview Invitation
      </a>

      {/* Social share */}
      <p className="text-xs text-parchment-600 mb-3 uppercase tracking-wider">Share on</p>
      <div className="flex gap-3">
        {shareButtons.map(btn => (
          <a
            key={btn.id}
            id={btn.id}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium text-white transition-opacity hover:opacity-85"
            style={{ background: btn.color }}
          >
            {btn.icon}
            {btn.label}
          </a>
        ))}
      </div>

      {/* QR placeholder */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-parchment-600 mb-2">QR Code (Premium feature)</p>
        <div className="bg-white p-3 rounded inline-block opacity-40 cursor-not-allowed">
          <div className="w-20 h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
