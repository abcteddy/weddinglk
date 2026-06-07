import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-wedding flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-rose-400 text-xl">💍</span>
          <span className="font-serif text-xl text-white tracking-wider">WeddingLK</span>
        </Link>
      </nav>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-700/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gold-700/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {children}
      </div>

      <footer className="text-center py-4 text-xs text-parchment-700">
        © 2026 WeddingLK · Made for Sri Lankan couples
      </footer>
    </div>
  )
}
