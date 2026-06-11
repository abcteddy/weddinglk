'use client'

import { useState, FormEvent } from 'react'
import { RSVPFormData } from '@/types/rsvp'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'

interface RSVPFormProps {
  invitationId: string
  coupleName: string
  accentColor?: string
  textColor?: string
  guestId?: string | null
  guestName?: string | null
  guestPhone?: string | null
  guestEmail?: string | null
}

type Step = 'form' | 'submitting' | 'success' | 'error'

const MEAL_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'veg', label: '🥗 Vegetarian' },
  { value: 'non-veg', label: '🍖 Non-Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'halal', label: '☪️ Halal' },
]

const GUEST_COUNT_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} guest${i > 0 ? 's' : ''}`,
}))

export function RSVPForm({
  invitationId,
  coupleName,
  accentColor = '#c9889e',
  textColor = '#f5d0df',
  guestId = null,
  guestName = '',
  guestPhone = '',
  guestEmail = '',
}: RSVPFormProps) {
  const [step, setStep] = useState<Step>('form')
  const [attending, setAttending] = useState<'yes' | 'no' | 'maybe' | null>(null)
  const [formData, setFormData] = useState<Partial<RSVPFormData>>({
    name: guestName ?? '',
    phone: guestPhone ?? '',
    email: guestEmail ?? '',
    guestCount: '1',
    meal: '',
    dietary: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string>('')

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!formData.name?.trim()) errs.name = 'Please enter your name'
    if (!attending) errs.attending = 'Please select your attendance'
    if (!formData.phone?.trim()) errs.phone = 'Please enter your phone number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStep('submitting')

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          guestName: formData.name,
          phone: formData.phone,
          email: formData.email,
          attending,
          guestCount: attending === 'no' ? 0 : parseInt(formData.guestCount ?? '1'),
          meal: attending === 'no' ? null : formData.meal,
          dietaryNotes: attending === 'no' ? null : formData.dietary,
          message: formData.message,
          guestId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'RSVP failed')
      setStep('success')
    } catch (err: any) {
      console.error('RSVP error:', err)
      setErrorMessage(err.message ?? 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-10 animate-fade-up">
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}` }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={accentColor} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: accentColor }} />
        </div>

        <h3 className="text-2xl font-serif mb-3" style={{ color: textColor }}>
          {attending === 'yes' ? 'See you there! 🎉' : attending === 'maybe' ? 'Hope to see you! 🤞' : 'Thank you for letting us know'}
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          {attending === 'yes'
            ? `We can't wait to celebrate with you at ${coupleName}'s wedding!`
            : attending === 'maybe'
            ? `We hope you can make it! We'll save a placeholder for you.`
            : `We're sorry you can't make it. You'll be missed!`}
        </p>

        {(attending === 'yes' || attending === 'maybe') && (
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href={`https://wa.me/?text=I%20just%20RSVPd%20to%20${encodeURIComponent(coupleName)}%27s%20wedding!%20%F0%9F%92%8D`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: '#25D366' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </a>
          </div>
        )}
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8 animate-fade-up">
        <p className="text-red-400 mb-4">{errorMessage}</p>
        <Button onClick={() => setStep('form')} variant="secondary">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif mb-1" style={{ color: textColor }}>RSVP</h2>
        <p className="text-sm opacity-60" style={{ color: textColor }}>
          Kindly let us know if you&apos;ll be joining us
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate id="rsvp-form">
        {/* Attendance toggle */}
        <div>
          <p className="text-sm font-medium text-parchment-300 tracking-wide mb-2">Will you attend?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'yes', label: '✓ Accept' },
              { value: 'maybe', label: '❓ Maybe' },
              { value: 'no', label: '✗ Decline' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                id={`attend-${opt.value}`}
                onClick={() => { setAttending(opt.value as any); setErrors(prev => ({ ...prev, attending: '' })) }}
                className={`py-2.5 rounded-sm border text-xs font-medium transition-all duration-200 ${
                  attending === opt.value
                    ? 'border-transparent text-white'
                    : 'border-white/10 text-parchment-400 hover:border-white/25'
                }`}
                style={attending === opt.value ? { background: accentColor } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.attending && <p className="text-xs text-red-400 mt-1">{errors.attending}</p>}
        </div>

        <Input
          id="rsvp-name"
          label="Your Full Name"
          placeholder="e.g. Kamal Perera"
          value={formData.name ?? ''}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
          disabled={!!guestName} // disable editing if name is pre-filled from personalized link
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="rsvp-phone"
            label="Phone Number"
            placeholder="07X XXX XXXX"
            type="tel"
            value={formData.phone ?? ''}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            error={errors.phone}
            required
          />

          <Input
            id="rsvp-email"
            label="Email Address (optional)"
            placeholder="name@example.com"
            type="email"
            value={formData.email ?? ''}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        {(attending === 'yes' || attending === 'maybe') && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="rsvp-guests"
                label="Number of Guests"
                options={GUEST_COUNT_OPTIONS}
                value={formData.guestCount}
                onChange={e => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
              />

              <Select
                id="rsvp-meal"
                label="Meal Preference"
                options={MEAL_OPTIONS}
                value={formData.meal}
                onChange={e => setFormData(prev => ({ ...prev, meal: e.target.value as RSVPFormData['meal'] }))}
              />
            </div>

            <Input
              id="rsvp-dietary"
              label="Dietary Requirements (optional)"
              placeholder="e.g. Peanut allergy, gluten-free"
              value={formData.dietary ?? ''}
              onChange={e => setFormData(prev => ({ ...prev, dietary: e.target.value }))}
            />
          </>
        )}

        <Textarea
          id="rsvp-message"
          label="Message for the Couple (optional)"
          placeholder="Send your wishes..."
          rows={3}
          value={formData.message ?? ''}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={step === 'submitting'}
          className="w-full"
          id="rsvp-submit"
          style={{ background: accentColor }}
        >
          {step === 'submitting' ? 'Sending...' : 'Send RSVP'}
        </Button>
      </form>
    </div>

  )
}
