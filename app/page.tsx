import type { Metadata } from 'next'
import Link from 'next/link'
import { TEMPLATE_LIST } from '@/lib/three/templates'
import { HeroScene } from '@/components/3d/HeroScene'

export const metadata: Metadata = {
  title: 'WeddingLK — 3D Wedding Invitations for Sri Lanka',
  description:
    'Create stunning 3D interactive wedding invitations. Share via unique link. Track RSVPs live. Made for Sri Lankan couples.',
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-rose-400 text-xl">💍</span>
        <span className="font-serif text-xl text-white tracking-wider">WeddingLK</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-parchment-400">
        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
        <a href="#templates" className="hover:text-white transition-colors">Templates</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden md:block text-sm text-parchment-400 hover:text-white transition-colors px-4 py-2">
          Sign In
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium px-5 py-2.5 rounded-sm bg-rose-700 text-white hover:bg-rose-600 transition-all hover:shadow-rose-glow"
          id="nav-get-started"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row items-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-700/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/8 rounded-full blur-3xl animate-pulse-slow delay-300" />
      </div>

      {/* Left: Copy */}
      <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 lg:px-20 pt-32 lg:pt-0 lg:w-[45%] space-y-8">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-700/15 border border-rose-700/30 text-rose-300 text-xs tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Sri Lanka&apos;s First 3D Wedding Invitation
          </div>

          <h1 className="font-serif text-5xl md:text-6xl xl:text-7xl font-bold leading-tight text-white">
            Your Love Story,{' '}
            <span className="italic" style={{ color: '#c9889e' }}>
              In 3D
            </span>
          </h1>

          <p className="mt-6 text-lg text-parchment-400 leading-relaxed max-w-md">
            Create a stunning interactive 3D wedding invitation, share it via a unique link,
            and watch RSVPs pour in — all in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-200">
          <Link
            href="/register"
            id="hero-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-700 text-white font-medium rounded-sm hover:bg-rose-600 transition-all hover:shadow-rose-glow text-base"
          >
            Create Your Invitation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            id="hero-cta-secondary"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-parchment-300 font-medium rounded-sm hover:border-white/30 hover:text-white transition-all text-base"
          >
            See How it Works
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex items-center gap-6 text-xs text-parchment-600 animate-fade-up delay-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free to start
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No design skills needed
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            PayHere LKR payments
          </div>
        </div>
      </div>

      {/* Right: 3D Scene */}
      <div className="relative lg:w-[55%] w-full h-[500px] lg:h-screen animate-fade-in">
        <HeroScene />
        {/* Click hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-gentle pointer-events-none">
          <p className="text-xs text-parchment-500 uppercase tracking-widest">Click to open</p>
          <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    step: '01',
    icon: '✏️',
    title: 'Create Your Invitation',
    desc: 'Fill in your wedding details — names, date, venue — and choose from our beautiful 3D templates.',
  },
  {
    step: '02',
    icon: '🔗',
    title: 'Share Your Unique Link',
    desc: 'Get a personalized link like weddinglk.com/inv/kamal-nisha. Share on WhatsApp, Facebook, or SMS.',
  },
  {
    step: '03',
    icon: '📊',
    title: 'Track RSVPs Live',
    desc: 'Your dashboard updates in real-time as guests confirm attendance. No more manual follow-ups.',
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rose-400 text-xs uppercase tracking-[0.4em] mb-3">Simple Process</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">How WeddingLK Works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="relative glass-card glass-card-hover p-8 text-center group"
            >
              {/* Connector line */}
              {idx < HOW_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(100%+0px)] w-8 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
              )}

              <div className="text-4xl mb-4">{step.icon}</div>
              <div
                className="text-xs font-bold tracking-widest mb-3 font-sans"
                style={{ color: '#c9889e' }}
              >
                STEP {step.step}
              </div>
              <h3 className="font-serif text-xl text-white mb-3">{step.title}</h3>
              <p className="text-sm text-parchment-500 leading-relaxed">{step.desc}</p>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-700/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Templates Section ────────────────────────────────────────────────────────
function TemplatesSection() {
  return (
    <section id="templates" className="py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-700/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rose-400 text-xs uppercase tracking-[0.4em] mb-3">Design Choices</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Beautiful Templates</h2>
          <p className="mt-4 text-parchment-500 max-w-xl mx-auto">
            Each template features a unique 3D scene with matching colors, particles, and lighting.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_LIST.map((template, idx) => (
            <Link
              key={template.id}
              href="/register"
              id={`template-preview-${template.id}`}
              className="group block rounded-sm overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {/* Preview */}
              <div
                className="h-48 relative flex items-center justify-center"
                style={{ background: template.previewGradient }}
              >
                {/* Fake 3D envelope */}
                <div className="w-24 h-16 relative group-hover:scale-110 transition-transform duration-500">
                  <div
                    className="absolute inset-0 rounded-sm"
                    style={{ background: `#${template.envelopeColor.toString(16).padStart(6, '0')}`, border: `1px solid ${template.accentColor}30` }}
                  />
                  {/* Flap */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0 border-l-[48px] border-r-[48px] border-t-[24px] border-l-transparent border-r-transparent"
                    style={{ borderTopColor: template.accentColor + '60' }}
                  />
                  {/* Seal */}
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full group-hover:animate-pulse"
                    style={{ background: template.accentColor, boxShadow: `0 0 12px ${template.accentColor}` }}
                  />
                </div>

                {/* Floating petals */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full opacity-40 animate-float"
                      style={{
                        background: template.accentColor,
                        left: `${20 + i * 20}%`,
                        top: `${10 + (i % 2) * 40}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${2.5 + i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-black/40">
                <p className="font-serif text-sm text-white">{template.name}</p>
                <p className="text-xs text-parchment-600 mt-0.5" style={{ fontFamily: template.fontFamily }}>
                  {template.fontFamily.split(',')[0].replace(/'/g, '')}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: template.accentColor }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: template.textColor }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/register" id="templates-cta" className="text-sm text-rose-400 hover:text-rose-300 transition-colors underline underline-offset-4">
            More templates coming soon →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing Section ──────────────────────────────────────────────────────────
const PRICING = [
  {
    id: 'basic',
    name: 'Basic',
    price: 990,
    popular: false,
    features: [
      '3D Interactive Invitation',
      'RSVP System',
      'Live Dashboard',
      'Shareable Link',
      '2 Templates',
      '20 SMS Notifications',
    ],
    missing: ['Couple Photo Upload', 'Custom Colors', 'Unlimited SMS', 'QR Code', 'WhatsApp Card'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2490,
    popular: true,
    features: [
      '3D Interactive Invitation',
      'RSVP System',
      'Live Dashboard',
      'Shareable Link',
      'All 4 Templates',
      'Couple Photo Upload',
      'Custom Colors',
      'Unlimited SMS',
      'QR Code (coming soon)',
      'WhatsApp Card (coming soon)',
      'Priority Support',
    ],
    missing: [],
  },
]

function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 md:px-12 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rose-400 text-xs uppercase tracking-[0.4em] mb-3">Simple Pricing</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">One-Time Payment, No Monthly Fees</h2>
          <p className="mt-4 text-parchment-500">Pay once for your wedding invitation. No subscriptions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PRICING.map(plan => (
            <div
              key={plan.id}
              id={`pricing-${plan.id}`}
              className={`relative rounded-sm p-8 border transition-all duration-300 ${
                plan.popular
                  ? 'border-rose-700/50 bg-gradient-to-b from-rose-900/20 to-transparent shadow-rose-glow/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-rose-700 text-white text-xs font-medium rounded-full tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-medium text-parchment-400 uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-parchment-600">Rs.</span>
                  <span className="text-5xl font-bold text-white">{plan.price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-parchment-600 mt-1">LKR · One-time payment</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-parchment-300">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-parchment-700 line-through">
                    <svg className="w-4 h-4 text-parchment-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                id={`pricing-cta-${plan.id}`}
                className={`block text-center py-3 rounded-sm font-medium text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-rose-700 text-white hover:bg-rose-600 hover:shadow-rose-glow'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                Get Started with {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Nisha & Kamal',
    location: 'Colombo',
    text: "WeddingLK made our invitation process so easy! Our guests loved opening the 3D envelope. We got all 120 RSVPs within 3 days!",
    avatar: 'NK',
    color: '#c9889e',
  },
  {
    name: 'Amara & Roshan',
    location: 'Kandy',
    text: "The live dashboard was incredible — we could see RSVPs coming in during breakfast! Way better than paper cards.",
    avatar: 'AR',
    color: '#d4a017',
  },
  {
    name: 'Priya & Dinesh',
    location: 'Galle',
    text: "Our guests kept sharing the invitation because it was so unique. The Classic Ivory template was absolutely beautiful.",
    avatar: 'PD',
    color: '#52b788',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-24 px-6 md:px-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-950/30 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="text-rose-400 text-xs uppercase tracking-[0.4em] mb-3">Love Stories</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">Couples Who Chose WeddingLK</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass-card p-6 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold-500">★</span>
                ))}
              </div>
              <p className="text-sm text-parchment-300 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: t.color + '40', border: `1px solid ${t.color}` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-parchment-600">{t.location}, Sri Lanka</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-700/20 blur-3xl rounded-full" />
          <h2 className="relative font-serif text-4xl md:text-5xl text-white mb-6">
            Begin Your Love Story Today
          </h2>
        </div>
        <p className="text-parchment-400 text-lg mb-10">
          Join hundreds of Sri Lankan couples who created their dream digital wedding invitation on WeddingLK.
        </p>
        <Link
          href="/register"
          id="footer-cta"
          className="inline-flex items-center gap-3 px-10 py-4 bg-rose-700 text-white font-medium rounded-sm text-lg hover:bg-rose-600 transition-all hover:shadow-rose-glow"
        >
          <span>💍</span>
          Create Your Free Invitation
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <p className="text-xs text-parchment-700 mt-4">No credit card required · Free invitation builder</p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-rose-400">💍</span>
          <span className="font-serif text-white">WeddingLK</span>
        </div>
        <p className="text-xs text-parchment-700">
          Built with ❤️ for Sri Lankan couples · 2026
        </p>
        <div className="flex gap-6 text-xs text-parchment-600">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-wedding">
      <Nav />
      <HeroSection />
      <HowItWorksSection />
      <TemplatesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
