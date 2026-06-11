'use client'

import { useState } from 'react'

export function HeroMockup() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleEnvelope = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[300px] h-[300px] bg-rose-700/10 rounded-full blur-[100px] transition-all duration-1000" style={{ transform: isOpen ? 'scale(1.2)' : 'scale(1)' }} />
        <div className="w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[80px] delay-300" />
      </div>

      {/* Floating Petals / Gold Flakes (Pure CSS Animation) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-200 opacity-45 animate-float"
            style={{
              left: `${10 + i * 9}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Perspective Wrapper */}
      <div 
        onClick={toggleEnvelope}
        className="relative w-full max-w-[380px] aspect-[4/3] cursor-pointer group"
        style={{ perspective: '1200px' }}
      >
        {/* ENVELOPE CONTAINER */}
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-[1.02]">
          
          {/* 1. Envelope Back (z-index: 5) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d1115] to-[#1c080b] border border-[#d4af37]/15 rounded-sm shadow-2xl z-5 overflow-hidden">
            {/* Inner liner gold pattern */}
            <div className="absolute inset-2 border border-dashed border-[#d4af37]/10 rounded-sm" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/20 via-transparent to-transparent" />
          </div>

          {/* 2. Invitation Card (z-index: 10) */}
          {/* Closed: nestled inside envelope. Open: slides up and out */}
          <div 
            className="absolute left-[5%] right-[5%] bottom-[8%] h-[85%] bg-gradient-to-b from-[#fffaf4] to-[#fbf5eb] border-[2px] border-[#d4af37] p-5 flex flex-col justify-between text-center shadow-xl transition-all duration-700 ease-in-out"
            style={{ 
              transform: isOpen 
                ? 'translateY(-50%) scale(1.02)' 
                : 'translateY(0) scale(0.95)',
              zIndex: isOpen ? 35 : 10,
              boxShadow: isOpen ? '0 25px 50px -12px rgba(0,0,0,0.6)' : '0 10px 25px -5px rgba(0,0,0,0.3)'
            }}
          >
            {/* Card Gold Border/Filigree */}
            <div className="absolute inset-1.5 border border-[#d4af37]/30" />
            <div className="absolute inset-2.5 border border-[#d4af37]/10" />

            {/* Inner Content */}
            <div className="relative flex flex-col justify-between h-full py-1">
              <div>
                <p className="text-[8px] uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Save The Date</p>
                <div className="w-6 h-px bg-[#d4af37]/30 mx-auto mt-1" />
              </div>

              {/* Names */}
              <div className="my-2">
                <h2 className="font-serif text-3xl font-bold text-[#1f0b0d] tracking-wide leading-none">Kamal</h2>
                <p className="font-serif text-sm italic text-[#d4af37] my-0.5">&</p>
                <h2 className="font-serif text-3xl font-bold text-[#1f0b0d] tracking-wide leading-none">Nisha</h2>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <p className="text-[9px] tracking-wider text-[#4a3235] font-semibold uppercase">Saturday, June 27, 2026</p>
                <p className="text-[8px] text-[#8c676b]">Colombo, Sri Lanka</p>
              </div>

              {/* Action Button Mockup */}
              <div className="mt-2">
                <span className="inline-block px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-800 to-rose-700 rounded-full shadow-md border border-rose-900/30">
                  RSVP NOW
                </span>
              </div>
            </div>
          </div>

          {/* 3. Front Flaps (Sides and Bottom) (z-index: 20) */}
          {/* Renders the envelope opening slit shapes using clean vector SVG */}
          <svg 
            viewBox="0 0 400 300" 
            className="absolute inset-0 w-full h-full z-20 drop-shadow-lg pointer-events-none"
            preserveAspectRatio="none"
          >
            {/* Left side flap */}
            <polygon points="0,0 200,150 0,300" fill="#260e11" stroke="#d4af37" strokeWidth="0.5" opacity="0.97" />
            {/* Right side flap */}
            <polygon points="400,0 200,150 400,300" fill="#260e11" stroke="#d4af37" strokeWidth="0.5" opacity="0.97" />
            {/* Bottom flap */}
            <polygon points="0,300 200,150 400,300" fill="#1d0a0c" stroke="#d4af37" strokeWidth="0.5" opacity="0.99" />
          </svg>

          {/* 4. Top Envelope Flap (z-index: 30) */}
          {/* Rotates upwards by 180deg around top edge */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 origin-top transition-transform duration-700 ease-in-out"
            style={{ 
              transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
              zIndex: isOpen ? 6 : 30,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <svg 
              viewBox="0 0 400 150" 
              className="w-full h-full drop-shadow-md"
              preserveAspectRatio="none"
            >
              <polygon points="0,0 200,150 400,0" fill="#361519" stroke="#d4af37" strokeWidth="0.75" />
            </svg>

            {/* Premium Gold & Wax Seal (Only visible when closed) */}
            {!isOpen && (
              <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center z-50">
                {/* Outer Glow ring */}
                <div className="absolute inset-0 bg-[#d4af37]/35 rounded-full blur-[4px] animate-ping opacity-60" />
                {/* Red Wax Seal */}
                <div className="relative w-8 h-8 bg-gradient-to-br from-[#c91833] to-[#800517] rounded-full border border-[#d4af37]/40 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                  <span className="text-[10px] text-[#ffe6a3] font-serif font-semibold">💍</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Backside of Open Flap (to look clean when open, z-index: 6) */}
          {isOpen && (
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 origin-top transition-transform duration-700 ease-in-out pointer-events-none"
              style={{ 
                transform: 'rotateX(180deg)',
                zIndex: 6,
              }}
            >
              <svg 
                viewBox="0 0 400 150" 
                className="w-full h-full drop-shadow-md opacity-90"
                preserveAspectRatio="none"
              >
                <polygon points="0,0 200,150 400,0" fill="#1b080a" stroke="#d4af37" strokeWidth="0.5" />
              </svg>
            </div>
          )}

        </div>
      </div>

      {/* Floating Instructions/Status Text */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-xs text-parchment-400 uppercase tracking-widest font-medium animate-pulse">
          {isOpen ? 'Click to close envelope' : 'Click to open envelope'}
        </p>
        <p className="text-[10px] text-parchment-700 max-w-[280px]">
          Demo previewing the interactive invitation design, loading instantly without performance lag.
        </p>
      </div>

      {/* Tailwind Float keyframes definitions */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(15deg) scale(1.15); opacity: 0.6; }
        }
        .animate-float {
          animation: float infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  )
}
