'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSlug } from '@/lib/utils/slug'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    partner1: '',
    partner2: '',
  })

  const validate = (): string | null => {
    if (!form.partner1.trim()) return 'Please enter your name'
    if (!form.partner2.trim()) return "Please enter your partner's name"
    if (!form.email.includes('@')) return 'Please enter a valid email'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            partner1_name: form.partner1,
            partner2_name: form.partner2,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Registration failed')

      // Redirect to dashboard (user will need to verify email)
      router.push('/dashboard?welcome=1')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  // Live slug preview
  const slugPreview = form.partner1 && form.partner2
    ? generateSlug(form.partner1, form.partner2, new Date().getFullYear() + 1)
    : ''

  return (
    <div className="w-full max-w-md">
      <div className="glass-card p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💍</div>
          <h1 className="font-serif text-3xl text-white mb-2">Create Your Invitation</h1>
          <p className="text-sm text-parchment-500">Start for free, upgrade anytime</p>
        </div>

        {/* Google */}
        <button
          type="button"
          id="google-register-btn"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 border border-white/15 rounded-sm text-sm text-parchment-300 hover:bg-white/5 hover:border-white/30 transition-all mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-parchment-700">or register with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          {error && (
            <div className="px-4 py-3 bg-red-900/30 border border-red-700/40 rounded-sm text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Partner names */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="register-partner1"
              label="Your Name"
              placeholder="Kamal"
              value={form.partner1}
              onChange={e => setForm(prev => ({ ...prev, partner1: e.target.value }))}
              required
            />
            <Input
              id="register-partner2"
              label="Partner's Name"
              placeholder="Nisha"
              value={form.partner2}
              onChange={e => setForm(prev => ({ ...prev, partner2: e.target.value }))}
              required
            />
          </div>

          {/* Slug preview */}
          {slugPreview && (
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-sm">
              <p className="text-xs text-parchment-600 mb-0.5">Your invitation link will be:</p>
              <p className="text-xs text-rose-400 font-mono">weddinglk.com/inv/{slugPreview}</p>
            </div>
          )}

          <Input
            id="register-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
            autoComplete="email"
          />

          <Input
            id="register-password"
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
            required
            autoComplete="new-password"
          />

          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            id="register-submit"
          >
            Create My Free Invitation
          </Button>

          <p className="text-xs text-center text-parchment-700">
            By registering, you agree to our{' '}
            <Link href="/terms" className="text-parchment-500 hover:text-white underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-parchment-500 hover:text-white underline">Privacy Policy</Link>
          </p>
        </form>

        <p className="text-center text-sm text-parchment-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-rose-400 hover:text-rose-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
