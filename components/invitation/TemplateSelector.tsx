'use client'

import { TemplateId, TemplateConfig } from '@/types/invitation'
import { TEMPLATE_LIST } from '@/lib/three/templates'
import { cn } from '@/lib/utils/cn'

interface TemplateSelectorProps {
  value: TemplateId
  onChange: (id: TemplateId) => void
}

function TemplateCard({ template, selected, onClick }: {
  template: TemplateConfig
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      id={`template-${template.id}`}
      onClick={onClick}
      className={cn(
        'relative rounded-sm overflow-hidden border-2 transition-all duration-300 group',
        selected
          ? 'border-rose-500 shadow-rose-glow scale-105'
          : 'border-white/10 hover:border-white/30 hover:scale-[1.02]',
      )}
    >
      {/* Preview gradient */}
      <div
        className="h-20 w-full"
        style={{ background: template.previewGradient }}
      >
        {/* Mini envelope icon */}
        <div className="h-full flex items-center justify-center">
          <div
            className="w-10 h-7 rounded-sm relative flex items-center justify-center"
            style={{ background: `rgba(255,255,255,0.08)`, border: `1px solid ${template.accentColor}40` }}
          >
            {/* Flap triangle */}
            <div
              className="absolute top-0 left-0 right-0 h-0 border-l-[20px] border-r-[20px] border-t-[10px] border-l-transparent border-r-transparent"
              style={{ borderTopColor: template.accentColor + '80' }}
            />
            {/* Seal dot */}
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: template.accentColor }}
            />
          </div>
        </div>
      </div>

      {/* Template name */}
      <div
        className="py-2 px-3 text-center"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <p className="text-xs font-medium tracking-wide" style={{ color: template.textColor }}>
          {template.name}
        </p>
        <div className="flex gap-1 justify-center mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: template.accentColor }} />
          <div className="w-2 h-2 rounded-full" style={{ background: template.sealColor.toString(16).padStart(6, '0') ? `#${template.sealColor.toString(16).padStart(6, '0')}` : template.accentColor }} />
        </div>
      </div>

      {/* Selected badge */}
      {selected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: template.accentColor }}
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium text-parchment-300 tracking-wide mb-3">Choose Template</p>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_LIST.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={value === template.id}
            onClick={() => onChange(template.id)}
          />
        ))}
      </div>
    </div>
  )
}
