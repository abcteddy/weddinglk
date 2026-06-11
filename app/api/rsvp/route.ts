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

    let existingRSVP: any = null

    // 1. If guestId is provided, look up by guest_id
    if (guestId) {
      const { data } = await (supabase.from('rsvps') as any)
        .select('id')
        .eq('invitation_id', invitationId)
        .eq('guest_id', guestId)
        .maybeSingle() as { data: any | null }
      existingRSVP = data
    } 
    // 2. If no guestId but name and phone are provided, look up by name and phone
    else if (guestName && phone) {
      const { data } = await (supabase.from('rsvps') as any)
        .select('id')
        .eq('invitation_id', invitationId)
        .eq('guest_name', guestName.trim())
        .eq('guest_phone', phone.trim())
        .maybeSingle() as { data: any | null }
      existingRSVP = data
    }

    let rsvp: any = null
    let rsvpError: any = null

    const rsvpPayload = {
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
    }

    if (existingRSVP) {
      // Update existing RSVP
      const { data, error } = await (supabase.from('rsvps') as any)
        .update(rsvpPayload)
        .eq('id', existingRSVP.id)
        .select()
        .single() as { data: any | null; error: any }
      rsvp = data
      rsvpError = error
    } else {
      // Insert new RSVP
      const { data, error } = await (supabase.from('rsvps') as any)
        .insert(rsvpPayload)
        .select()
        .single() as { data: any | null; error: any }
      rsvp = data
      rsvpError = error
    }

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

