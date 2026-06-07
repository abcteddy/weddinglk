import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { extractInvitationId } from '@/lib/payhere'

/**
 * PayHere Notify URL (webhook)
 * PayHere sends a POST form-data to this URL when payment status changes
 * Status codes: 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Chargebacked
 */
export async function POST(req: Request) {
  try {
    const body = await req.formData()

    const merchantId = body.get('merchant_id') as string
    const orderId = body.get('order_id') as string
    const paymentId = body.get('payment_id') as string
    const payhereAmount = body.get('payhere_amount') as string
    const payhereCurrency = body.get('payhere_currency') as string
    const statusCode = body.get('status_code') as string
    const md5sig = body.get('md5sig') as string

    // Verify signature
    const merchantSecret = process.env.PAYHERE_SECRET!
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const localSig = crypto
      .createHash('md5')
      .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash)
      .digest('hex')
      .toUpperCase()

    if (localSig !== md5sig) {
      console.error('[PayHere] Invalid signature')
      return new Response('Invalid signature', { status: 400 })
    }

    const supabase = await createClient()
    const invitationId = extractInvitationId(orderId)

    if (statusCode === '2') {
      // Payment successful — publish invitation
      const itemsStr = body.get('items')?.toString() ?? ''
      let pkg: 'basic' | 'premium' | 'luxury' = 'basic'
      if (itemsStr.includes('Luxury')) {
        pkg = 'luxury'
      } else if (itemsStr.includes('Premium')) {
        pkg = 'premium'
      }

      await Promise.all([
        (supabase.from('couples') as any)
          .update({ is_paid: true, is_published: true, package: pkg })
          .eq('id', invitationId),
        (supabase.from('payments') as any)
          .update({ status: 'completed' })
          .eq('payhere_order_id', orderId),
      ])

      console.log(`[PayHere] Payment successful for invitation ${invitationId}`)
    } else if (statusCode === '-1' || statusCode === '-2') {
      await (supabase.from('payments') as any)
        .update({ status: statusCode === '-1' ? 'cancelled' : 'failed' })
        .eq('payhere_order_id', orderId)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('[PayHere] Webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
