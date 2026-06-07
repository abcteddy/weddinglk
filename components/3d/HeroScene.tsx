'use client'

import dynamic from 'next/dynamic'
import { TEMPLATES } from '@/lib/three/templates'

const InvitationScene = dynamic(
  () => import('@/components/3d/InvitationScene').then(m => m.InvitationScene),
  { ssr: false, loading: () => <div className="w-full h-full bg-rose-950/30 animate-pulse" /> },
)

export function HeroScene() {
  return (
    <div className="relative w-full h-full">
      <InvitationScene
        template={TEMPLATES.classic}
        burstMode={false}
        className="w-full h-full"
      />
    </div>
  )
}
