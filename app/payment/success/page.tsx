import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Payment Successful' }

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-wedding flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass-card p-12">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-8 relative">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-30" />
        </div>

        <h1 className="font-serif text-3xl text-white mb-4">Payment Successful! 🎉</h1>
        <p className="text-parchment-400 mb-2">
          Your WeddingLK invitation is now live and ready to share.
        </p>
        <p className="text-parchment-600 text-sm mb-8">
          Your guests can now RSVP online, and you&apos;ll receive SMS notifications for each response.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            id="payment-success-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 text-white font-medium rounded-sm hover:bg-rose-600 transition-all hover:shadow-rose-glow"
          >
            📊 Go to Dashboard
          </Link>
          <Link
            href="/builder"
            id="payment-success-builder"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 text-parchment-300 rounded-sm hover:bg-white/10 transition-all"
          >
            ✏️ Edit Invitation
          </Link>
        </div>
      </div>
    </div>
  )
}
