import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StorageManager } from '@/components/dashboard/StorageManager'
import { Invitation } from '@/types/invitation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Storage & Database Manager',
  description: 'Manage your uploaded photos, files, and database usage permanently.',
}

export default async function StoragePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch invitation
  const { data: invitation } = await (supabase.from('couples') as any)
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Invitation | null }

  if (!invitation) {
    redirect('/dashboard')
  }

  // Get table row counts for database stats
  let rsvpCount = 0
  let guestCount = 0
  let uploadCount = 0

  const { count: rsvps } = await (supabase.from('rsvps') as any)
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation.id)
  rsvpCount = rsvps ?? 0

  const { count: guests } = await (supabase.from('guests') as any)
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation.id)
  guestCount = guests ?? 0

  const { count: uploads } = await (supabase.from('guest_uploads') as any)
    .select('*', { count: 'exact', head: true })
    .eq('invitation_id', invitation.id)
  uploadCount = uploads ?? 0

  return (
    <StorageManager
      userId={user.id}
      invitation={invitation}
      rsvpCount={rsvpCount}
      guestCount={guestCount}
      uploadCount={uploadCount}
    />
  )
}
