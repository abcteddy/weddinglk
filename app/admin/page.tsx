import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Panel' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.user_metadata?.is_admin) redirect('/')

  const { data: invitations } = await (supabase.from('couples') as any)
    .select('id, partner1_name, partner2_name, slug, package, is_paid, is_published, created_at, user_id')
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Get RSVP counts
  const invitationIds = invitations?.map(i => i.id) ?? []
  const rsvpCounts: Record<string, number> = {}
  if (invitationIds.length > 0) {
    const { data: rsvpData } = await (supabase.from('rsvps') as any)
      .select('invitation_id')
      .in('invitation_id', invitationIds) as { data: any[] | null }

    rsvpData?.forEach(r => {
      rsvpCounts[r.invitation_id] = (rsvpCounts[r.invitation_id] ?? 0) + 1
    })
  }

  const stats = {
    total: invitations?.length ?? 0,
    paid: invitations?.filter(i => i.is_paid).length ?? 0,
    published: invitations?.filter(i => i.is_published).length ?? 0,
    revenue: invitations?.filter(i => i.is_paid).reduce((sum, i) => sum + (i.package === 'premium' ? 2490 : 990), 0) ?? 0,
  }

  return (
    <div className="min-h-screen bg-wedding p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-white">Admin Panel</h1>
          <span className="text-xs text-parchment-600 px-3 py-1.5 bg-white/5 border border-white/10 rounded">
            🔐 Admin Only
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invitations', value: stats.total, icon: '📬' },
            { label: 'Paid', value: stats.paid, icon: '✅' },
            { label: 'Published', value: stats.published, icon: '🌐' },
            { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-parchment-500 text-xs">{s.label}</span>
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Invitations table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-base font-medium text-white">All Invitations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Couple', 'Slug', 'Package', 'Paid', 'Published', 'RSVPs', 'Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-parchment-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invitations?.map(inv => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">
                      {inv.partner1_name} & {inv.partner2_name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/inv/${inv.slug}`}
                        target="_blank"
                        className="text-rose-400 hover:text-rose-300 font-mono text-xs"
                      >
                        {inv.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        inv.package === 'premium'
                          ? 'bg-gold-700/20 text-gold-400'
                          : 'bg-white/10 text-parchment-400'
                      }`}>
                        {inv.package}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={inv.is_paid ? 'text-green-400' : 'text-red-400'}>
                        {inv.is_paid ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={inv.is_published ? 'text-green-400' : 'text-parchment-600'}>
                        {inv.is_published ? '🌐 Live' : '⏸ Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parchment-400">
                      {rsvpCounts[inv.id] ?? 0}
                    </td>
                    <td className="px-4 py-3 text-parchment-600 text-xs">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
