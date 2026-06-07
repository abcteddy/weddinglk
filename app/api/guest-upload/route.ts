import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { invitationId, url, fileType, guestName } = body

    if (!invitationId || !url || !guestName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert guest upload record
    const { data: upload, error: uploadError } = await (supabase.from('guest_uploads') as any)
      .insert({
        invitation_id: invitationId,
        url,
        file_type: fileType ?? 'image',
        guest_name: guestName,
        is_moderated: false, // Default is false, needs couple's approval
      })
      .select()
      .single() as { data: any | null; error: any }

    if (uploadError) {
      console.error('[Guest Upload] Database error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, upload })
  } catch (err) {
    console.error('[Guest Upload] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
