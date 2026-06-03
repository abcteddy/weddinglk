/**
 * Notify.lk SMS helper for Sri Lanka
 * Docs: https://app.notify.lk/api/docs
 */

function formatSriLankaPhone(phone: string): string {
  // Convert 07XXXXXXXX → 947XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  if (cleaned.startsWith('94')) return cleaned
  if (cleaned.startsWith('0')) return `94${cleaned.slice(1)}`
  return `94${cleaned}`
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      user_id: process.env.NOTIFY_USER_ID!,
      api_key: process.env.NOTIFY_API_KEY!,
      sender_id: 'WeddingLK',
      to: formatSriLankaPhone(phone),
      message,
    })

    const res = await fetch(`https://app.notify.lk/api/v1/send?${params.toString()}`, {
      method: 'GET',
    })
    const data = await res.json()
    return data.status === 'success'
  } catch (err) {
    console.error('[Notify.lk] SMS send failed:', err)
    return false
  }
}

export async function notifyCouple(
  couplePhone: string,
  guestName: string,
  attending: boolean,
  guestCount?: number,
): Promise<boolean> {
  const guestInfo = guestCount && guestCount > 1 ? ` (${guestCount} guests)` : ''
  const msg = attending
    ? `🎉 ${guestName}${guestInfo} has confirmed attendance at your wedding! Check your WeddingLK dashboard for details.`
    : `${guestName} has regretfully declined your wedding invitation.`

  return sendSMS(couplePhone, msg)
}
