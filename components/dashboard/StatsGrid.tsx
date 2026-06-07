'use client'

interface ExtendedRSVPStats {
  totalInvitations: number
  sentInvitations: number
  openedInvitations: number
  attendingGuests: number
  declinedGuests: number
  maybeGuests: number
  pendingResponses: number
  totalGuestsCount: number
  totalFamiliesCount: number
  guestCountForecast: number
}

interface StatsGridProps {
  stats: ExtendedRSVPStats
}

interface StatCardProps {
  value: number
  label: string
  icon: string
  color: string
  bgColor: string
}

function StatCard({ value, label, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-white/10 bg-white/5 p-4 md:p-6 group hover:border-white/20 transition-all duration-300">
      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
          <p className="text-xs text-parchment-500 tracking-wide">{label}</p>
        </div>
        <div
          className="w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center text-base md:text-xl"
          style={{ background: bgColor }}
        >
          {icon}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: color }} />
    </div>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="space-y-6">
      {/* 1. Invitations Metrics */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-parchment-500 font-serif">✉️ Invitation Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            value={stats.totalInvitations}
            label="Total Links Generated"
            icon="👥"
            color="#c9889e"
            bgColor="rgba(201,136,158,0.15)"
          />
          <StatCard
            value={stats.sentInvitations}
            label="Sent Invitations"
            icon="📤"
            color="#3a86c8"
            bgColor="rgba(58,134,200,0.15)"
          />
          <StatCard
            value={stats.openedInvitations}
            label="Opened Invitations"
            icon="📖"
            color="#52b788"
            bgColor="rgba(82,183,136,0.15)"
          />
        </div>
      </div>

      {/* 2. RSVP Metrics */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-parchment-500 font-serif">📨 RSVP Responses</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={stats.attendingGuests}
            label="Attending"
            icon="✓"
            color="#52b788"
            bgColor="rgba(82,183,136,0.15)"
          />
          <StatCard
            value={stats.declinedGuests}
            label="Declined"
            icon="✗"
            color="#e07070"
            bgColor="rgba(224,112,112,0.15)"
          />
          <StatCard
            value={stats.maybeGuests}
            label="Maybe"
            icon="❓"
            color="#e9c46a"
            bgColor="rgba(233,196,110,0.15)"
          />
          <StatCard
            value={stats.pendingResponses}
            label="Pending RSVP"
            icon="⏳"
            color="#a8a8a8"
            bgColor="rgba(168,168,168,0.15)"
          />
        </div>
      </div>

      {/* 3. Guest Statistics */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-parchment-500 font-serif">📊 Guest Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            value={stats.totalGuestsCount}
            label="Confirmed Attendees"
            icon="👥"
            color="#d4a017"
            bgColor="rgba(212,160,23,0.15)"
          />
          <StatCard
            value={stats.totalFamiliesCount}
            label="Total Families responding"
            icon="🏠"
            color="#9b5de5"
            bgColor="rgba(155,93,229,0.15)"
          />
          <StatCard
            value={stats.guestCountForecast}
            label="Guest Count Forecast"
            icon="📈"
            color="#f15bb5"
            bgColor="rgba(241,91,181,0.15)"
          />
        </div>
      </div>
    </div>
  )
}
