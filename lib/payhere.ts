import crypto from 'crypto'

export const PACKAGES = {
  basic: {
    price: 990,
    name: 'Basic',
    currency: 'LKR',
    description: 'WeddingLK Basic Package',
  },
  premium: {
    price: 2490,
    name: 'Premium',
    currency: 'LKR',
    description: 'WeddingLK Premium Package',
  },
} as const

export type PackageKey = keyof typeof PACKAGES

/**
 * Generate PayHere hash (MUST be done server-side — never expose merchant secret to client)
 * Formula: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string,
): string {
  const secretHash = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase()

  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amount + currency + secretHash)
    .digest('hex')
    .toUpperCase()

  return hash
}

export function getPayHereCheckoutUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout'
}

export function formatOrderId(invitationId: string): string {
  return `${invitationId}-${Date.now()}`
}

export function extractInvitationId(orderId: string): string {
  return orderId.split('-')[0]
}
