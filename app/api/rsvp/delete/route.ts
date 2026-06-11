import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { rsvpId } = await req.json()
    if (!rsvpId) {
      return NextResponse.json({ error: 'Missing RSVP ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Get logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch the RSVP using the user's client (which will only succeed if the user is the owner due to RLS "RSVPs: owner read")
    const { data: rsvp, error: rsvpError } = await (supabase.from('rsvps') as any)
      .select('id, invitation_id, guest_id')
      .eq('id', rsvpId)
      .single() as { data: any | null; error: any }

    if (rsvpError || !rsvp) {
      console.error('[Delete RSVP] Fetch error:', rsvpError)
      return NextResponse.json({ error: 'RSVP not found or access denied' }, { status: 403 })
    }

    // 3. Delete the RSVP using the service role key to bypass the delete RLS policy
    const supabaseService = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: deleteError } = await supabaseService
      .from('rsvps')
      .delete()
      .eq('id', rsvpId)

    if (deleteError) {
      console.error('[Delete RSVP] Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // 4. If there is a personalization guest linked, reset their status to pending
    if (rsvp.guest_id) {
      await supabaseService
        .from('guests')
        .update({
          rsvp_status: 'pending',
          guest_count: 1,
          dietary_notes: null,
          status: 'sent'
        })
        .eq('id', rsvp.guest_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Delete RSVP] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
