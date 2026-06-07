import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { GuestList } from '@/components/dashboard/GuestList'
import { SharePanel } from '@/components/dashboard/SharePanel'
import { PhotoModeration } from '@/components/dashboard/PhotoModeration'
import { RSVP } from '@/types/rsvp'
import { Invitation } from '@/types/invitation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your RSVP stats and guest list in real-time.',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch invitation
  const { data: invitation } = await (supabase.from('couples') as any)
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Invitation | null }

  let rsvps: RSVP[] = []
  let guests: any[] = []
  let guestUploads: any[] = []

  if (invitation) {
    // Fetch RSVPs
    rsvps = await (supabase.from('rsvps') as any)
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => (data as RSVP[]) ?? [])

    // Fetch Guests
    guests = await (supabase.from('guests') as any)
      .select('*')
      .eq('invitation_id', invitation.id)
      .then(({ data }: any) => data ?? [])

    // Fetch Guest Uploads (For Photo Moderation Wall)
    guestUploads = await (supabase.from('guest_uploads') as any)
      .select('*')
      .eq('invitation_id', invitation.id)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => data ?? [])
  }

  // Compute metrics
  const totalInvitations = guests.length
  const sentInvitations = guests.filter(g => g.status === 'sent' || g.status === 'opened').length
  const openedInvitations = guests.filter(g => g.status === 'opened').length

  const attendingGuests = rsvps.filter(r => r.attendance_status === 'yes' || r.attending).length
  const declinedGuests = rsvps.filter(r => r.attendance_status === 'no' || (!r.attending && r.attendance_status !== 'maybe')).length
  const maybeGuests = rsvps.filter(r => r.attendance_status === 'maybe').length
  const pendingResponses = guests.filter(g => g.rsvp_status === 'pending').length

  const totalGuestsCount = rsvps
    .filter(r => r.attendance_status === 'yes' || r.attendance_status === 'maybe' || r.attending)
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0)
  
  const totalFamiliesCount = rsvps.length

  const confirmedRsvpCount = rsvps.filter(r => r.attendance_status === 'yes' || r.attending).length
  const avgSize = confirmedRsvpCount > 0 ? (totalGuestsCount / confirmedRsvpCount) : 1.8
  const guestCountForecast = Math.round(totalGuestsCount + (pendingResponses * avgSize * 0.6))

  const stats = {
    totalInvitations,
    sentInvitations,
    openedInvitations,
    attendingGuests,
    declinedGuests,
    maybeGuests,
    pendingResponses,
    totalGuestsCount,
    totalFamiliesCount,
    guestCountForecast,
  }

  const coupleName = invitation
    ? `${invitation.partner1_name} & ${invitation.partner2_name}`
    : 'Your Wedding'

  // Photo moderation is active for premium/luxury plans
  const showModeration = invitation && (invitation.package === 'luxury' || (invitation as any).package === 'premium')

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      {params.welcome && (
        <div className="px-6 py-4 bg-rose-700/15 border border-rose-700/30 rounded-sm flex items-center gap-3 animate-fade-up">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-white font-medium">Welcome to WeddingLK!</p>
            <p className="text-sm text-parchment-400">
              Your account is ready. Head to the{' '}
              <Link href="/builder" className="text-rose-400 underline">Invitation Builder</Link>
              {' '}to create your 3D wedding invitation.
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">{coupleName}</h1>
          {invitation && (
            <p className="text-parchment-500 text-sm mt-1">
              {invitation.wedding_date} · {invitation.venue_name}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {invitation ? (
            <Link
              href="/builder"
              id="edit-invitation-btn"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 text-sm text-parchment-300 rounded-sm hover:bg-white/10 hover:text-white transition-all"
            >
              ✏️ Edit Invitation
            </Link>
          ) : (
            <Link
              href="/builder"
              id="create-invitation-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-700 text-white text-sm font-medium rounded-sm hover:bg-rose-600 transition-all"
            >
              💍 Create Invitation
            </Link>
          )}
        </div>
      </div>

      {/* No invitation state */}
      {!invitation ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-6">💌</div>
          <h2 className="font-serif text-2xl text-white mb-3">You don&apos;t have an invitation yet</h2>
          <p className="text-parchment-500 mb-6 max-w-md mx-auto">
            Create your 3D wedding invitation in minutes. Choose a template, add your details, and start sharing!
          </p>
          <Link
            href="/builder"
            id="dashboard-create-btn"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-700 text-white font-medium rounded-sm hover:bg-rose-600 transition-all hover:shadow-rose-glow"
          >
            Create Your Invitation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <StatsGrid stats={stats} />

          {/* Payment warning */}
          {!invitation.is_paid && (
            <div className="flex items-start gap-3 px-5 py-4 bg-amber-900/20 border border-amber-700/30 rounded-sm">
              <span className="text-amber-400 text-xl mt-0.5">⚠️</span>
              <div>
                <p className="text-amber-300 font-medium text-sm">Your invitation is not published</p>
                <p className="text-amber-500/80 text-xs mt-0.5">
                  Complete payment to publish your invitation and start collecting RSVPs.
                </p>
              </div>
              <Link
                href={`/builder?tab=payment`}
                id="activate-now-btn"
                className="ml-auto shrink-0 px-4 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-500 transition-colors"
              >
                Activate Now
              </Link>
            </div>
          )}

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Guest list - takes 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <GuestList initialRsvps={rsvps} invitationId={invitation.id} />
              
              {showModeration && (
                <PhotoModeration initialPhotos={guestUploads} invitationId={invitation.id} />
              )}
            </div>

            {/* Share panel - takes 1/3 */}
            <div>
              <SharePanel
                slug={invitation.slug}
                coupleName={coupleName}
                isPublished={invitation.is_published}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
