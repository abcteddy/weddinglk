'use client'

import { useEffect, useState } from 'react'
import { RSVP } from '@/types/rsvp'
import { createClient } from '@/lib/supabase/client'

interface GuestListProps {
  initialRsvps: RSVP[]
  invitationId: string
}

const MEAL_EMOJI: Record<string, string> = {
  veg: '🥗',
  'non-veg': '🍖',
  vegan: '🌱',
  halal: '☪️',
}

export function GuestList({ initialRsvps, invitationId }: GuestListProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>(initialRsvps)
  const [filter, setFilter] = useState<'all' | 'attending' | 'declined' | 'maybe'>('all')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('rsvps-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rsvps',
          filter: `invitation_id=eq.${invitationId}`,
        },
        payload => {
          setRsvps(prev => [payload.new as RSVP, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invitationId, supabase])

  const filtered = rsvps.filter(r => {
    const status = r.attendance_status ?? (r.attending ? 'yes' : 'no')
    if (filter === 'attending') return status === 'yes'
    if (filter === 'declined') return status === 'no'
    if (filter === 'maybe') return status === 'maybe'
    return true
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Client-side CSV/Excel export
  const exportToCSV = () => {
    const headers = ['Guest Name', 'Email', 'Phone', 'Attendance Status', 'Guest Count', 'Meal Preference', 'Dietary Requirements', 'Message', 'Date RSVPd']
    const rows = rsvps.map(r => [
      r.guest_name,
      r.email ?? '—',
      r.guest_phone ?? '—',
      r.attendance_status ?? (r.attending ? 'yes' : 'no'),
      r.attending ? r.guest_count ?? 1 : 0,
      r.meal_preference ?? '—',
      r.dietary_notes ?? '—',
      (r.message ?? '').replace(/"/g, '""'),
      new Date(r.created_at).toLocaleString(),
    ])

    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `WeddingLK_RSVPs_${invitationId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const attendingCount = rsvps.filter(r => (r.attendance_status ?? (r.attending ? 'yes' : 'no')) === 'yes').length
  const declinedCount = rsvps.filter(r => (r.attendance_status ?? (r.attending ? 'yes' : 'no')) === 'no').length
  const maybeCount = rsvps.filter(r => (r.attendance_status ?? (r.attending ? 'yes' : 'no')) === 'maybe').length

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden" id="print-section">
      {/* Print PDF Custom Stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except print-section */
          body > *:not(#print-section) {
            display: none !important;
          }
          #print-section {
            border: none !important;
            background: white !important;
            color: black !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            color: black !important;
          }
          th, td {
            border: 1px solid #ccc !important;
            padding: 6px 8px !important;
            color: black !important;
            background: transparent !important;
          }
          th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
          }
          .avatar-badge {
            display: none !important;
          }
          .text-white {
            color: black !important;
          }
          .text-parchment-400, .text-parchment-500, .text-parchment-600 {
            color: #374151 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/10 no-print">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-medium text-white">Guest List</h2>
          <div className="flex gap-1.5">
            <button
              onClick={exportToCSV}
              className="px-2.5 py-1 text-xs border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-sm text-parchment-300 transition-colors cursor-pointer"
              title="Download CSV for Excel / Numbers"
            >
              📥 CSV / Excel
            </button>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 text-xs border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-sm text-parchment-300 transition-colors cursor-pointer"
              title="Print Guest Sheet or Save as PDF"
            >
              🖨️ PDF / Print
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-black/30 rounded-sm p-0.5">
          {(['all', 'attending', 'declined', 'maybe'] as const).map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[11px] capitalize rounded-sm transition-all ${
                filter === f
                  ? 'bg-rose-700 text-white'
                  : 'text-parchment-500 hover:text-white'
              }`}
            >
              {f} {f === 'all' ? `(${rsvps.length})` : f === 'attending' ? `(${attendingCount})` : f === 'declined' ? `(${declinedCount})` : `(${maybeCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-parchment-600">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-sm">No RSVPs match this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/10">
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Guest Details</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Guests</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Meal</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Dietary Requirements</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left font-medium text-parchment-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rsvp, idx) => {
                const status = rsvp.attendance_status ?? (rsvp.attending ? 'yes' : 'no')
                return (
                  <tr
                    key={rsvp.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="avatar-badge w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{
                            background: status === 'yes' ? 'rgba(82,183,136,0.2)' : status === 'no' ? 'rgba(224,112,112,0.2)' : 'rgba(233,196,110,0.2)',
                            color: status === 'yes' ? '#52b788' : status === 'no' ? '#e07070' : '#e9c46a'
                          }}>
                          {rsvp.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{rsvp.guest_name}</p>
                          {(rsvp.guest_phone || rsvp.email) && (
                            <p className="text-[10px] text-parchment-600 font-light no-print">
                              {[rsvp.guest_phone, rsvp.email].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        status === 'yes'
                          ? 'bg-green-900/40 text-green-400 border border-green-800/30'
                          : status === 'no'
                          ? 'bg-red-900/40 text-red-400 border border-red-800/30'
                          : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/30'
                      }`}>
                        {status === 'yes' ? '✓ Attending' : status === 'no' ? '✗ Declined' : '❓ Maybe'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parchment-400">
                      {status !== 'no' ? rsvp.guest_count ?? 1 : '—'}
                    </td>
                    <td className="px-4 py-3 text-parchment-400">
                      {rsvp.meal_preference ? (
                        <span className="flex items-center gap-1">{MEAL_EMOJI[rsvp.meal_preference] ?? ''} {rsvp.meal_preference}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-parchment-400 italic">
                      {rsvp.dietary_notes ? rsvp.dietary_notes : '—'}
                    </td>
                    <td className="px-4 py-3 text-parchment-500 max-w-[150px]">
                      {rsvp.message ? (
                        <span className="italic truncate block" title={rsvp.message}>
                          &ldquo;{rsvp.message}&rdquo;
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-parchment-600 whitespace-nowrap">
                      {formatDate(rsvp.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
