import { createClient } from '@/lib/supabase/server'
import { notifyCouple } from '@/lib/notify'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { invitationId, guestName, phone, attending, guestCount, meal, message, guestId, dietaryNotes, email } = body

    if (!invitationId || !guestName || !attending) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Rate limit: check if same phone already RSVPd this invitation
    if (phone) {
      const { data: existing } = await (supabase.from('rsvps') as any)
        .select('id')
        .eq('invitation_id', invitationId)
        .eq('guest_phone', phone)
        .single() as { data: any | null }

      if (existing) {
        return NextResponse.json(
          { error: 'You have already RSVPd to this invitation' },
          { status: 429 },
        )
      }
    }

    // Insert RSVP
    const { data: rsvp, error: rsvpError } = await (supabase.from('rsvps') as any)
      .insert({
        invitation_id: invitationId,
        guest_name: guestName,
        guest_phone: phone ?? null,
        attending: attending === 'yes' || attending === 'maybe',
        guest_count: guestCount ?? 1,
        meal_preference: meal ?? null,
        message: message ?? null,
        guest_id: guestId ?? null,
        attendance_status: attending,
        dietary_notes: dietaryNotes ?? null,
        email: email ?? null,
      })
      .select()
      .single() as { data: any | null; error: any }

    if (rsvpError) {
      console.error('[RSVP] Insert error:', rsvpError)
      return NextResponse.json({ error: rsvpError.message }, { status: 400 })
    }

    // Update personalized guest status if guestId is provided
    if (guestId) {
      await (supabase.from('guests') as any)
        .update({
          rsvp_status: attending,
          guest_count: guestCount ?? 1,
          dietary_notes: dietaryNotes ?? null,
          status: 'opened',
        })
        .eq('id', guestId)
    }

    // Fetch couple phone for SMS notification (async — don't block response)
    (supabase.from('couples') as any)
      .select('couple_phone')
      .eq('id', invitationId)
      .single()
      .then(({ data }: any) => {
        if (data?.couple_phone) {
          notifyCouple(data.couple_phone, guestName, attending === 'yes' || attending === 'maybe', guestCount)
        }
      })

    return NextResponse.json({ success: true, rsvp })
  } catch (err) {
    console.error('[RSVP] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

