import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/builder', label: 'Invitation Builder', icon: '✏️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="h-screen bg-wedding flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-8 py-3 bg-black/60 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-rose-400">💍</span>
          <span className="font-serif text-white tracking-wider">WeddingLK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace('/', '')}`}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm text-parchment-400 hover:text-white hover:bg-white/8 transition-all"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-xs text-parchment-600 hidden md:block">{user.email}</div>
          <form action={handleSignOut}>
            <button
              type="submit"
              id="sign-out-btn"
              className="text-sm text-parchment-500 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/10"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden flex border-b border-white/10 px-4">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-4 py-3 text-sm text-parchment-400 hover:text-white transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 w-full relative flex flex-col">
        {children}
      </main>
    </div>
  )
}
