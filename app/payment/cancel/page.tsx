import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Payment Cancelled' }

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-wedding flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass-card p-12">
        <div className="w-24 h-24 rounded-full border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">⏸️</span>
        </div>

        <h1 className="font-serif text-3xl text-white mb-4">Payment Cancelled</h1>
        <p className="text-parchment-400 mb-8">
          No worries! Your invitation details have been saved. You can complete payment anytime from your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/builder?tab=payment"
            id="payment-cancel-retry"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 text-white font-medium rounded-sm hover:bg-rose-600 transition-all"
          >
            💳 Try Again
          </Link>
          <Link
            href="/dashboard"
            id="payment-cancel-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 text-parchment-300 rounded-sm hover:bg-white/10 transition-all"
          >
            📊 Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
