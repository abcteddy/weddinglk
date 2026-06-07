import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await (supabase.from('couples') as any)
    .select('partner1_name, partner2_name, wedding_date, venue_name')
    .eq('slug', slug)
    .single() as { data: any | null }

  const name1 = data?.partner1_name ?? 'Your Name'
  const name2 = data?.partner2_name ?? 'Partner Name'
  const date = data?.wedding_date
    ? new Date(data.wedding_date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''
  const venue = data?.venue_name ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0005 0%, #1a0010 50%, #0a0005 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Background circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,26,74,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,11,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* WeddingLK logo */}
        <div style={{ color: '#c9889e', fontSize: '18px', letterSpacing: '6px', marginBottom: '32px', display: 'flex' }}>
          💍 WEDDINGLK
        </div>

        {/* Names */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{ color: '#f5d0df', fontSize: '64px', fontWeight: 'bold' }}>{name1}</div>
          <div style={{ color: '#c9889e', fontSize: '40px', fontStyle: 'italic' }}>&</div>
          <div style={{ color: '#f5d0df', fontSize: '64px', fontWeight: 'bold' }}>{name2}</div>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ width: '100px', height: '1px', background: 'rgba(201,136,158,0.5)' }} />
          <div style={{ color: '#c9889e', fontSize: '24px' }}>❧</div>
          <div style={{ width: '100px', height: '1px', background: 'rgba(201,136,158,0.5)' }} />
        </div>

        {/* You're invited */}
        <div style={{ color: '#c9889e', fontSize: '24px', letterSpacing: '4px', marginBottom: '16px', display: 'flex' }}>
          YOU&apos;RE INVITED
        </div>

        {date && (
          <div style={{ color: '#f5d0df', fontSize: '20px', opacity: 0.8, display: 'flex' }}>{date}</div>
        )}
        {venue && (
          <div style={{ color: '#9a7080', fontSize: '16px', marginTop: '8px', display: 'flex' }}>{venue}</div>
        )}

        {/* Bottom */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '13px',
          display: 'flex',
        }}>
          RSVP via weddinglk.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
