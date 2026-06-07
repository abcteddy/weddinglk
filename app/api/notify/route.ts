import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyCouple } from '@/lib/notify'

export async function POST(req: Request) {
  try {
    const { invitationId, guestName, attending, guestCount } = await req.json()
    const supabase = await createClient()

    const { data: invitation } = await supabase
      .from('couples')
      .select('couple_phone')
      .eq('id', invitationId)
      .single()

    if ((invitation as any)?.couple_phone) {
      await notifyCouple((invitation as any).couple_phone, guestName, Boolean(attending), guestCount)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Notify]', err)
    return NextResponse.json({ ok: false })
  }
}
