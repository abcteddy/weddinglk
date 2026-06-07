import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { InvitationPageClient } from '@/components/invitation/InvitationPageClient'
import { Invitation } from '@/types/invitation'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await (supabase.from('couples') as any)
    .select('partner1_name, partner2_name, wedding_date, venue_name')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: any | null }

  if (!data) return { title: 'Invitation Not Found' }

  const title = `${data.partner1_name} & ${data.partner2_name}'s Wedding Invitation`

  return {
    title,
    description: `You're invited to the wedding of ${data.partner1_name} & ${data.partner2_name} on ${data.wedding_date} at ${data.venue_name}. RSVP online!`,
    openGraph: {
      title,
      description: `You're invited! ${data.wedding_date} · ${data.venue_name}`,
      images: [`/api/og/${slug}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
    },
  }
}

export const revalidate = 0 // Disable cache to allow real-time guest tracking and updates

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { to: guestToken } = await searchParams
  const supabase = await createClient()

  const { data: invitation } = await (supabase.from('couples') as any)
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: Invitation | null }

  if (!invitation) notFound()

  // Fetch guest if token is present
  let guest = null
  if (guestToken) {
    const { data: guestData } = await (supabase.from('guests') as any)
      .select('*')
      .eq('invitation_id', invitation.id)
      .eq('token', guestToken)
      .single() as { data: any | null }

    if (guestData) {
      guest = guestData
      // If status is not opened, update it to opened
      if (guestData.status !== 'opened') {
        await (supabase.from('guests') as any)
          .update({ status: 'opened' })
          .eq('id', guestData.id)
      }
    }
  }

  // Fetch moderated guest uploads
  const { data: uploads } = await (supabase.from('guest_uploads') as any)
    .select('*')
    .eq('invitation_id', invitation.id)
    .eq('is_moderated', true)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return (
    <InvitationPageClient
      invitation={invitation}
      guest={guest}
      initialGuestUploads={uploads ?? []}
    />
  )
}

