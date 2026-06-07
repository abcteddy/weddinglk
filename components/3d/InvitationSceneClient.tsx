'use client'

import dynamic from 'next/dynamic'
import { TemplateConfig } from '@/types/invitation'

const InvitationScene = dynamic(
  () => import('@/components/3d/InvitationScene').then(m => m.InvitationScene),
  { ssr: false, loading: () => <div className="w-full h-full bg-rose-950/30 animate-pulse" /> },
)

interface InvitationSceneClientProps {
  template: TemplateConfig
  onOpen?: () => void
}

export function InvitationSceneClient({ template, onOpen }: InvitationSceneClientProps) {
  return (
    <InvitationScene
      template={template}
      burstMode={true}
      className="w-full h-full"
      onOpen={onOpen}
    />
  )
}
