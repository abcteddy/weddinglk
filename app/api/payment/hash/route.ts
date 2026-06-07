import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePayHereHash, getPayHereCheckoutUrl, formatOrderId, PACKAGES } from '@/lib/payhere'

export async function POST(req: Request) {
  try {
    const { invitationId, package: pkg } = await req.json()

    if (!invitationId || !pkg) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const packageData = PACKAGES[pkg as keyof typeof PACKAGES]
    if (!packageData) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify the invitation belongs to the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: invitation } = await (supabase.from('couples') as any)
      .select('id')
      .eq('id', invitationId)
      .eq('user_id', user.id)
      .single() as { data: any | null }

    if (!invitation) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

    const merchantId = process.env.PAYHERE_MERCHANT_ID!
    const merchantSecret = process.env.PAYHERE_SECRET!
    const orderId = formatOrderId(invitationId)
    const amount = packageData.price.toFixed(2)
    const currency = 'LKR'
    const isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true'

    const hash = generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret)

    // Record pending payment
    await (supabase.from('payments') as any).insert({
      invitation_id: invitationId,
      payhere_order_id: orderId,
      amount: packageData.price,
      currency,
      status: 'pending',
      package: pkg,
    })

    return NextResponse.json({
      hash,
      orderId,
      amount,
      merchantId,
      checkoutUrl: getPayHereCheckoutUrl(isSandbox),
    })
  } catch (err) {
    console.error('[Payment/Hash]', err)
    return NextResponse.json({ error: 'Failed to generate hash' }, { status: 500 })
  }
}
