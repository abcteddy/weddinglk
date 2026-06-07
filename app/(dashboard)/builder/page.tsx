'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { TemplateSelector } from '@/components/invitation/TemplateSelector'
import { TEMPLATES } from '@/lib/three/templates'
import { generateSlug } from '@/lib/utils/slug'
import { TemplateId, Invitation, TimelineEvent } from '@/types/invitation'
import { PACKAGES } from '@/lib/payhere'

const InvitationScene = dynamic(
  () => import('@/components/3d/InvitationScene').then(m => m.InvitationScene),
  { ssr: false, loading: () => <div className="w-full h-full bg-rose-950/30 animate-pulse rounded-sm" /> },
)

type Tab = 'details' | 'profile' | 'events' | 'timeline' | 'registry' | 'guests' | 'template' | 'media' | 'payment'

const TABS: { id: Tab; label: string; icon: string; minPackage?: 'basic' | 'premium' | 'luxury' }[] = [
  { id: 'details', label: 'Details', icon: '📋' },
  { id: 'profile', label: 'Profiles', icon: '🤵👰' },
  { id: 'events', label: 'Events & Maps', icon: '📍' },
  { id: 'timeline', label: 'Timeline', icon: '⏳' },
  { id: 'registry', label: 'Registry & Live', icon: '🎁', minPackage: 'luxury' },
  { id: 'guests', label: 'Guest Links', icon: '👥', minPackage: 'premium' },
  { id: 'template', label: 'Template', icon: '🎨' },
  { id: 'media', label: 'Media', icon: '🎵' },
  { id: 'payment', label: 'Activate', icon: '💳' },
]

export default function BuilderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('details')
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [freeLoading, setFreeLoading] = useState(false)
  const [uploading, setUploading] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'premium' | 'luxury'>('basic')

  // Guest Manager State
  const [guests, setGuests] = useState<any[]>([])
  const [guestLoading, setGuestLoading] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '' })
  const [guestSearch, setGuestSearch] = useState('')

  // Timeline Event Form State
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' })

  const [form, setForm] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_date: '',
    wedding_time: '6:00 PM',
    venue_name: '',
    venue_address: '',
    rsvp_deadline: '',
    template_id: 'classic' as TemplateId,
    custom_message: '',
    couple_phone: '',
    cover_url: '',
    music_url: '',
    video_url: '',
    gallery_urls: [] as string[],

    // Bride Profile
    bride_photo_url: '',
    bride_full_name: '',
    bride_parents: '',
    bride_bio: '',

    // Groom Profile
    groom_photo_url: '',
    groom_full_name: '',
    groom_parents: '',
    groom_bio: '',

    // Event details
    reception_time: '7:00 PM',
    dress_code: '',
    additional_instructions: '',
    google_maps_embed_url: '',

    // Contacts
    bride_contact: '',
    groom_contact: '',
    family_contact: '',
    whatsapp_number: '',

    // Timeline
    timeline_events: [] as TimelineEvent[],

    // Registry
    registry_bank_details: '',
    registry_qr_url: '',
    registry_preferences: '',
    registry_online_contributions: false,

    // Streaming
    live_stream_platform: 'youtube',
    live_stream_url: '',
    live_stream_active: false,
  })

  // Load existing invitation
  useEffect(() => {
    async function loadInvitation() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await (supabase.from('couples') as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: Invitation | null }

      if (data) {
        setExistingId(data.id)
        setForm({
          partner1_name: data.partner1_name ?? '',
          partner2_name: data.partner2_name ?? '',
          wedding_date: data.wedding_date ?? '',
          wedding_time: data.wedding_time ?? '6:00 PM',
          venue_name: data.venue_name ?? '',
          venue_address: data.venue_address ?? '',
          rsvp_deadline: data.rsvp_deadline ?? '',
          template_id: (data.template_id as TemplateId) ?? 'classic',
          custom_message: data.custom_message ?? '',
          couple_phone: (data as any).couple_phone ?? '',
          cover_url: data.cover_url ?? '',
          music_url: data.music_url ?? '',
          video_url: data.video_url ?? '',
          gallery_urls: data.gallery_urls ?? [],

          // Bride Profile
          bride_photo_url: data.bride_photo_url ?? '',
          bride_full_name: data.bride_full_name ?? '',
          bride_parents: data.bride_parents ?? '',
          bride_bio: data.bride_bio ?? '',

          // Groom Profile
          groom_photo_url: data.groom_photo_url ?? '',
          groom_full_name: data.groom_full_name ?? '',
          groom_parents: data.groom_parents ?? '',
          groom_bio: data.groom_bio ?? '',

          // Event Details
          reception_time: data.reception_time ?? '7:00 PM',
          dress_code: data.dress_code ?? '',
          additional_instructions: data.additional_instructions ?? '',
          google_maps_embed_url: data.google_maps_embed_url ?? '',

          // Contacts
          bride_contact: data.bride_contact ?? '',
          groom_contact: data.groom_contact ?? '',
          family_contact: data.family_contact ?? '',
          whatsapp_number: data.whatsapp_number ?? '',

          // Timeline
          timeline_events: data.timeline_events ?? [],

          // Registry
          registry_bank_details: data.registry_bank_details ?? '',
          registry_qr_url: data.registry_qr_url ?? '',
          registry_preferences: data.registry_preferences ?? '',
          registry_online_contributions: data.registry_online_contributions ?? false,

          // Streaming
          live_stream_platform: data.live_stream_platform ?? 'youtube',
          live_stream_url: data.live_stream_url ?? '',
          live_stream_active: data.live_stream_active ?? false,
        })
        setSelectedPackage((data.package as 'basic' | 'premium' | 'luxury') ?? 'basic')
      } else if (user.user_metadata) {
        // Pre-fill from registration
        setForm(prev => ({
          ...prev,
          partner1_name: user.user_metadata.partner1_name ?? '',
          partner2_name: user.user_metadata.partner2_name ?? '',
        }))
      }
      setLoading(false)
    }
    loadInvitation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load guest list if Guest manager tab is active
  useEffect(() => {
    async function loadGuests() {
      if (!existingId) return
      setGuestLoading(true)
      const { data } = await (supabase.from('guests') as any)
        .select('*')
        .eq('invitation_id', existingId)
        .order('created_at', { ascending: false })
      if (data) setGuests(data)
      setGuestLoading(false)
    }
    if (tab === 'guests' && existingId) {
      loadGuests()
    }
  }, [tab, existingId, supabase])

  const handleSave = async () => {
    setSaveLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!form.wedding_date) throw new Error('Please select a wedding date')

      const slug = generateSlug(form.partner1_name, form.partner2_name, new Date(form.wedding_date).getFullYear())

      const payload = {
        ...form,
        slug,
        user_id: user.id,
        package: selectedPackage,
      }

      let result: { data: Invitation | null; error: any }
      if (existingId) {
        result = await (supabase.from('couples') as any)
          .update(payload)
          .eq('id', existingId)
          .select()
          .single() as { data: Invitation | null; error: any }
      } else {
        result = await (supabase.from('couples') as any)
          .insert(payload)
          .select()
          .single() as { data: Invitation | null; error: any }

        if (result.data) setExistingId(result.data.id)
      }

      if (result.error) throw result.error
      setSuccess('Saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaveLoading(false)
    }
  }

  const handlePayHere = async () => {
    if (!existingId) {
      setError('Please save your invitation details first')
      return
    }

    try {
      const res = await fetch('/api/payment/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: existingId, package: selectedPackage }),
      })
      const { hash, orderId, amount, merchantId, checkoutUrl } = await res.json()

      const form_el = document.createElement('form')
      form_el.method = 'POST'
      form_el.action = checkoutUrl

      const fields = {
        merchant_id: merchantId,
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payment`,
        order_id: orderId,
        items: `WeddingLK ${PACKAGES[selectedPackage].name} Package`,
        amount: amount,
        currency: 'LKR',
        hash: hash,
        first_name: form.partner1_name,
        last_name: form.partner2_name,
        email: '',
        phone: form.couple_phone,
        address: 'Sri Lanka',
        city: 'Colombo',
        country: 'Sri Lanka',
      }

      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = v ?? ''
        form_el.appendChild(input)
      })

      document.body.appendChild(form_el)
      form_el.submit()
    } catch (err) {
      setError('Failed to initiate payment. Please try again.')
    }
  }

  const handleFreeActivate = async () => {
    if (!existingId) {
      setError('Please save your invitation details first')
      return
    }

    setFreeLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await (supabase.from('couples') as any)
        .update({
          is_published: true,
          is_paid: true,
          package: selectedPackage,
        })
        .eq('id', existingId)

      if (updateError) throw updateError

      setSuccess('Free Test Version activated successfully! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to activate free test version')
    } finally {
      setFreeLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'music' | 'video' | 'gallery' | 'groom_photo' | 'bride_photo' | 'registry_qr') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to upload files')
      return
    }

    const uploadSingle = async (file: File) => {
      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 10)
      const filePath = `${user.id}/${type}_${randomId}.${fileExt}`

      setUploading(prev => ({ ...prev, [type]: 10 }))

      const { error: uploadError } = await supabase.storage
        .from('wedding-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      setUploading(prev => ({ ...prev, [type]: 100 }))
      setTimeout(() => {
        setUploading(prev => {
          const next = { ...prev }
          delete next[type]
          return next
        })
      }, 1000)

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-assets')
        .getPublicUrl(filePath)

      return publicUrl
    }

    try {
      if (type === 'gallery') {
        const currentGallery = form.gallery_urls ?? []
        if (currentGallery.length + files.length > 8) {
          throw new Error('You can only upload up to 8 gallery photos')
        }

        const urls: string[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File "${file.name}" is too large. Max size is 5MB.`)
          }
          const url = await uploadSingle(file)
          urls.push(url)
        }

        setForm(prev => ({
          ...prev,
          gallery_urls: [...(prev.gallery_urls ?? []), ...urls]
        }))
      } else {
        const file = files[0]
        const sizeLimit = (type === 'video' || type === 'cover') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
        const sizeLimitStr = (type === 'video' || type === 'cover') ? '50MB' : '10MB'
        if (file.size > sizeLimit) {
          throw new Error(`File size is too large. Max size is ${sizeLimitStr}`)
        }

        const url = await uploadSingle(file)
        setForm(prev => ({
          ...prev,
          [`${type}_url`]: url
        }))
      }
      setSuccess(`${type.toUpperCase()} uploaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to upload ${type}`)
      setUploading(prev => {
        const next = { ...prev }
        delete next[type]
        return next
      })
    }
  }

  const handleDeleteFile = async (type: 'cover' | 'music' | 'video' | 'gallery' | 'groom_photo' | 'bride_photo' | 'registry_qr', index?: number) => {
    setError('')
    setSuccess('')

    try {
      if (type === 'gallery' && typeof index === 'number') {
        const currentGallery = [...(form.gallery_urls ?? [])]
        const fileUrl = currentGallery[index]

        const pathParts = fileUrl.split('/wedding-assets/')
        if (pathParts.length > 1) {
          const storagePath = pathParts[1]
          await supabase.storage.from('wedding-assets').remove([storagePath])
        }

        currentGallery.splice(index, 1)
        setForm(prev => ({
          ...prev,
          gallery_urls: currentGallery
        }))
      } else {
        const fileUrl = form[`${type}_url` as keyof typeof form] as string
        if (fileUrl) {
          const pathParts = fileUrl.split('/wedding-assets/')
          if (pathParts.length > 1) {
            const storagePath = pathParts[1]
            await supabase.storage.from('wedding-assets').remove([storagePath])
          }
        }

        setForm(prev => ({
          ...prev,
          [`${type}_url`]: ''
        }))
      }
      setSuccess('File removed successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove file')
    }
  }

  // Guest actions
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuest.name.trim()) return

    try {
      const token = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { data, error: guestErr } = await (supabase.from('guests') as any)
        .insert({
          invitation_id: existingId,
          name: newGuest.name,
          phone: newGuest.phone || null,
          email: newGuest.email || null,
          token,
          status: 'pending',
          rsvp_status: 'pending',
        })
        .select()
        .single()

      if (guestErr) throw guestErr

      setGuests(prev => [data, ...prev])
      setNewGuest({ name: '', phone: '', email: '' })
      setSuccess('Guest invitation link generated successfully!')
      setTimeout(() => setSuccess(''), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Failed to add guest')
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const { error: deleteErr } = await (supabase.from('guests') as any)
        .delete()
        .eq('id', guestId)

      if (deleteErr) throw deleteErr
      setGuests(prev => prev.filter(g => g.id !== guestId))
      setSuccess('Guest deleted!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete guest')
    }
  }

  const getPersonalizedUrl = (token: string) => {
    const slug = generateSlug(form.partner1_name, form.partner2_name, new Date(form.wedding_date || Date.now()).getFullYear())
    return `${window.location.origin}/inv/${slug}?to=${token}`
  }

  const handleCopyLink = async (guestItem: any) => {
    const inviteUrl = getPersonalizedUrl(guestItem.token)
    await navigator.clipboard.writeText(inviteUrl)
    alert(`Link copied for ${guestItem.name}!`)

    // Update status to sent if it is pending
    if (guestItem.status === 'pending') {
      const { error: updateErr } = await (supabase.from('guests') as any)
        .update({ status: 'sent' })
        .eq('id', guestItem.id)
      if (!updateErr) {
        setGuests(prev => prev.map(g => g.id === guestItem.id ? { ...g, status: 'sent' } : g))
      }
    }
  }

  const copyGuestMessage = async (guestItem: any) => {
    const url = getPersonalizedUrl(guestItem.token)
    const text = `Hi ${guestItem.name}, we request the pleasure of your company at our wedding! 💍 Please view our interactive invitation and RSVP here: ${url}`
    await navigator.clipboard.writeText(text)
    alert(`Invite message copied to clipboard for ${guestItem.name}!`)

    // Update status to sent if it is pending
    if (guestItem.status === 'pending') {
      const { error: updateErr } = await (supabase.from('guests') as any)
        .update({ status: 'sent' })
        .eq('id', guestItem.id)
      if (!updateErr) {
        setGuests(prev => prev.map(g => g.id === guestItem.id ? { ...g, status: 'sent' } : g))
      }
    }
  }

  // Timeline actions
  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title.trim()) return

    const updatedEvents = [...(form.timeline_events ?? []), newEvent]
    setForm(prev => ({ ...prev, timeline_events: updatedEvents }))
    setNewEvent({ title: '', date: '', description: '' })
    setSuccess('Event added to story!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleDeleteTimelineEvent = (index: number) => {
    const updatedEvents = [...(form.timeline_events ?? [])]
    updatedEvents.splice(index, 1)
    setForm(prev => ({ ...prev, timeline_events: updatedEvents }))
  }

  const previewTemplate = TEMPLATES[form.template_id] ?? TEMPLATES.classic

  const packageBadgeText = (minPkg: 'basic' | 'premium' | 'luxury') => {
    if (minPkg === 'luxury') return '💎 Luxury Feature'
    if (minPkg === 'premium') return '🌟 Premium Feature'
    return ''
  }

  const isFeatureLocked = (minPkg?: 'basic' | 'premium' | 'luxury') => {
    if (!minPkg) return false
    if (selectedPackage === 'luxury') return false
    if (selectedPackage === 'premium' && minPkg === 'luxury') return true
    if (selectedPackage === 'basic' && minPkg !== 'basic') return true
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-parchment-500">Loading...</div>
      </div>
    )
  }

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
    (g.phone && g.phone.includes(guestSearch)) ||
    (g.email && g.email.toLowerCase().includes(guestSearch.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-white">
          {existingId ? 'Edit Your Invitation' : 'Create Your Invitation'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-rose-700/20 border border-rose-700/40 text-rose-300 font-semibold uppercase tracking-wider">
            Plan: {PACKAGES[selectedPackage].name}
          </span>
          <Button
            id="save-invitation-btn"
            variant="primary"
            onClick={handleSave}
            loading={saveLoading}
          >
            {existingId ? '💾 Save Changes' : '💍 Create Invitation'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-900/30 border border-red-700/40 rounded-sm text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-green-900/30 border border-green-700/40 rounded-sm text-sm text-green-400 animate-fade-in">
          ✓ {success}
        </div>
      )}

      {/* Scrollable Tab bar on mobile */}
      <div className="flex gap-1 bg-black/30 rounded-sm p-1 overflow-x-auto scrollbar-none whitespace-nowrap max-w-full">
        {TABS.map(t => {
          const locked = isFeatureLocked(t.minPackage)
          return (
            <button
              key={t.id}
              id={`builder-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs md:text-sm transition-all ${
                tab === t.id
                  ? 'bg-rose-700 text-white font-medium'
                  : locked
                  ? 'text-parchment-700 hover:text-white/60'
                  : 'text-parchment-500 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {locked && <span className="text-[10px]">🔒</span>}
            </button>
          )
        })}
      </div>

      {/* Main layout: Form + Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3">Wedding Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="builder-partner1"
                  label="Partner 1 Name (Groom / Bride)"
                  placeholder="Kamal"
                  value={form.partner1_name}
                  onChange={e => setForm(prev => ({ ...prev, partner1_name: e.target.value }))}
                />
                <Input
                  id="builder-partner2"
                  label="Partner 2 Name (Bride / Groom)"
                  placeholder="Nisha"
                  value={form.partner2_name}
                  onChange={e => setForm(prev => ({ ...prev, partner2_name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="builder-date"
                  label="Wedding Date"
                  type="date"
                  value={form.wedding_date}
                  onChange={e => setForm(prev => ({ ...prev, wedding_date: e.target.value }))}
                />
                <Input
                  id="builder-time"
                  label="Ceremony Time"
                  placeholder="6:00 PM"
                  value={form.wedding_time}
                  onChange={e => setForm(prev => ({ ...prev, wedding_time: e.target.value }))}
                />
              </div>

              <Input
                id="builder-venue"
                label="Venue Name"
                placeholder="Shangri-La Hotel Colombo"
                value={form.venue_name}
                onChange={e => setForm(prev => ({ ...prev, venue_name: e.target.value }))}
              />

              <Input
                id="builder-address"
                label="Venue Address (optional)"
                placeholder="Colombo 03, Sri Lanka"
                value={form.venue_address}
                onChange={e => setForm(prev => ({ ...prev, venue_address: e.target.value }))}
              />

              <Input
                id="builder-rsvp-deadline"
                label="RSVP Deadline (optional)"
                type="date"
                value={form.rsvp_deadline}
                onChange={e => setForm(prev => ({ ...prev, rsvp_deadline: e.target.value }))}
              />

              <Input
                id="builder-phone"
                label="Your Phone Number (for SMS alerts)"
                placeholder="07X XXX XXXX"
                type="tel"
                value={form.couple_phone}
                onChange={e => setForm(prev => ({ ...prev, couple_phone: e.target.value }))}
                hint="We'll SMS you when guests RSVP"
              />

              <Textarea
                id="builder-message"
                label="Custom Welcome Message (optional)"
                placeholder="We joyfully request the pleasure of your company..."
                rows={3}
                value={form.custom_message}
                onChange={e => setForm(prev => ({ ...prev, custom_message: e.target.value }))}
              />

              {form.partner1_name && form.partner2_name && form.wedding_date && (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-xs text-parchment-600 mb-1">Your public invitation link:</p>
                  <p className="text-sm font-mono text-rose-400">
                    /inv/{generateSlug(form.partner1_name, form.partner2_name, new Date(form.wedding_date).getFullYear())}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3">Couple Profiles</h2>

              {/* Groom Profile details */}
              <div className="space-y-4 p-4 border border-white/5 bg-white/5 rounded-sm">
                <h3 className="text-sm font-bold text-white font-serif">🤵 Groom Profile Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="groom-fullname"
                    label="Groom Full Name"
                    placeholder="Kamal Perera"
                    value={form.groom_full_name}
                    onChange={e => setForm(prev => ({ ...prev, groom_full_name: e.target.value }))}
                  />
                  <Input
                    id="groom-parents"
                    label="Groom's Parents Name"
                    placeholder="Mr. & Mrs. Perera"
                    value={form.groom_parents}
                    onChange={e => setForm(prev => ({ ...prev, groom_parents: e.target.value }))}
                  />
                </div>

                <Textarea
                  id="groom-bio"
                  label="Short Bio / Note"
                  placeholder="Tell your guests a bit about the groom..."
                  rows={2}
                  value={form.groom_bio}
                  onChange={e => setForm(prev => ({ ...prev, groom_bio: e.target.value }))}
                />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white block">Groom Photo</label>
                  {form.groom_photo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.groom_photo_url} alt="Groom Avatar" className="w-full h-full object-cover" />
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleDeleteFile('groom_photo')}>Remove Photo</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="groom-photo-upload"
                        className="hidden"
                        onChange={e => handleUpload(e, 'groom_photo')}
                      />
                      <label
                        htmlFor="groom-photo-upload"
                        className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-xs text-white"
                      >
                        {uploading.groom_photo ? `Uploading...` : 'Upload Groom Photo'}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Bride Profile details */}
              <div className="space-y-4 p-4 border border-white/5 bg-white/5 rounded-sm">
                <h3 className="text-sm font-bold text-white font-serif">👰 Bride Profile Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="bride-fullname"
                    label="Bride Full Name"
                    placeholder="Nisha Fernando"
                    value={form.bride_full_name}
                    onChange={e => setForm(prev => ({ ...prev, bride_full_name: e.target.value }))}
                  />
                  <Input
                    id="bride-parents"
                    label="Bride's Parents Name"
                    placeholder="Mr. & Mrs. Fernando"
                    value={form.bride_parents}
                    onChange={e => setForm(prev => ({ ...prev, bride_parents: e.target.value }))}
                  />
                </div>

                <Textarea
                  id="bride-bio"
                  label="Short Bio / Note"
                  placeholder="Tell your guests a bit about the bride..."
                  rows={2}
                  value={form.bride_bio}
                  onChange={e => setForm(prev => ({ ...prev, bride_bio: e.target.value }))}
                />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white block">Bride Photo</label>
                  {form.bride_photo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.bride_photo_url} alt="Bride Avatar" className="w-full h-full object-cover" />
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleDeleteFile('bride_photo')}>Remove Photo</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="bride-photo-upload"
                        className="hidden"
                        onChange={e => handleUpload(e, 'bride_photo')}
                      />
                      <label
                        htmlFor="bride-photo-upload"
                        className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-xs text-white"
                      >
                        {uploading.bride_photo ? `Uploading...` : 'Upload Bride Photo'}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS & CONTACTS TAB ── */}
          {tab === 'events' && (
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3">Event Settings & Maps</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="reception-time"
                  label="Reception Start Time"
                  placeholder="7:00 PM"
                  value={form.reception_time ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, reception_time: e.target.value }))}
                />
                <Input
                  id="dress-code"
                  label="Dress Code"
                  placeholder="Elegant / Traditional Sri Lankan"
                  value={form.dress_code ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, dress_code: e.target.value }))}
                />
              </div>

              <Textarea
                id="maps-embed"
                label="Google Maps Embed Code / Share URL"
                placeholder="Paste the <iframe...> code or maps.google.com link here"
                rows={2}
                value={form.google_maps_embed_url ?? ''}
                onChange={e => setForm(prev => ({ ...prev, google_maps_embed_url: e.target.value }))}
              />
              <p className="text-[10px] text-parchment-600 mt-1">Allows guests to navigate directly to the venue</p>

              <Textarea
                id="additional-instructions"
                label="Additional Instructions / Parking / Travel Info"
                placeholder="e.g. Free parking is available at Level 3 of the hotel. Children are welcome."
                rows={2}
                value={form.additional_instructions ?? ''}
                onChange={e => setForm(prev => ({ ...prev, additional_instructions: e.target.value }))}
              />

              <div className="border-t border-white/10 pt-4 space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">📞 Contact Information (For Questions / WhatsApp)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="bride-contact"
                    label="Bride Phone Number"
                    placeholder="07X XXX XXXX"
                    value={form.bride_contact ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, bride_contact: e.target.value }))}
                  />
                  <Input
                    id="groom-contact"
                    label="Groom Phone Number"
                    placeholder="07X XXX XXXX"
                    value={form.groom_contact ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, groom_contact: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="family-contact"
                    label="Family/Coordinator Phone"
                    placeholder="07X XXX XXXX"
                    value={form.family_contact ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, family_contact: e.target.value }))}
                  />
                  <Input
                    id="whatsapp-contact"
                    label="WhatsApp Chat Number"
                    placeholder="0771234567"
                    value={form.whatsapp_number ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    hint="For direct WhatsApp Us floating buttons"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TIMELINE TAB ── */}
          {tab === 'timeline' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3">Love Story Timeline</h2>

              {/* Add event form */}
              <form onSubmit={handleAddTimelineEvent} className="p-4 border border-white/5 bg-white/5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Story Journey Event</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="timeline-title"
                    label="Event Title"
                    placeholder="e.g. First Meeting, First Date, Engagement"
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <Input
                    id="timeline-date"
                    label="Event Date / Timeframe"
                    placeholder="e.g. June 2024"
                    value={newEvent.date}
                    onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <Textarea
                  id="timeline-desc"
                  label="Description / Short Story"
                  placeholder="Share a sweet summary of what happened during this milestone..."
                  rows={2}
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />

                <Button type="submit" variant="secondary" className="w-full text-xs py-1.5">➕ Add to Story</Button>
              </form>

              {/* Events list */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-serif">Current Timeline Milestones</h3>
                
                {(form.timeline_events ?? []).length === 0 ? (
                  <p className="text-xs text-parchment-600 italic">No timeline milestones added yet. Add milestones above like "First Meeting" or "The Proposal".</p>
                ) : (
                  <div className="space-y-2">
                    {(form.timeline_events ?? []).map((ev, i) => (
                      <div key={i} className="flex justify-between items-start p-3 bg-white/5 border border-white/10 rounded-sm text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-white flex items-center gap-2">
                            <span>{ev.title}</span>
                            {ev.date && <span className="px-1.5 py-0.5 bg-rose-700/20 text-rose-300 font-mono text-[9px] rounded-sm">{ev.date}</span>}
                          </p>
                          <p className="text-parchment-400 font-light leading-relaxed">{ev.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTimelineEvent(i)}
                          className="text-red-500 hover:text-red-400 font-medium ml-4 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REGISTRY & LIVE STREAM TAB ── */}
          {tab === 'registry' && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-serif text-white">Gift Registry & Live Streaming</h2>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold rounded-full">
                  💎 Luxury Feature
                </span>
              </div>

              {isFeatureLocked('luxury') ? (
                <div className="p-5 text-center border border-white/10 bg-black/25 rounded-sm space-y-3">
                  <p className="text-sm text-white font-medium">🔒 Registry & Live Stream is locked</p>
                  <p className="text-xs text-parchment-500 max-w-sm mx-auto">
                    Gift registry details, scan-to-pay QR uploads, and virtual live stream links are available on the Luxury package.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setTab('payment')}>
                    Upgrade Plan in Activate Tab
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Registry details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-serif">🎁 Gift Registry Details</h3>
                    
                    <Textarea
                      id="registry-bank"
                      label="Bank Account Details (For gifts/transfer)"
                      placeholder="Bank Name: Commercial Bank&#10;Account Holder: K. Perera&#10;Account Number: 1000998822&#10;Branch: Colombo Fort"
                      rows={4}
                      value={form.registry_bank_details ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, registry_bank_details: e.target.value }))}
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white block">Upload Payment QR Code image</label>
                      {form.registry_qr_url ? (
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 border border-white/10 rounded overflow-hidden p-1 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={form.registry_qr_url} alt="Registry QR" className="w-full h-full object-contain" />
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => handleDeleteFile('registry_qr')}>Remove QR</Button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="registry-qr-upload"
                            className="hidden"
                            onChange={e => handleUpload(e, 'registry_qr')}
                          />
                          <label
                            htmlFor="registry-qr-upload"
                            className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-xs text-white"
                          >
                            {uploading.registry_qr ? `Uploading...` : 'Upload Payment QR'}
                          </label>
                        </div>
                      )}
                    </div>

                    <Textarea
                      id="registry-preferences"
                      label="Gift Preferences / Wishlist / Honeymoon Registry note"
                      placeholder="e.g. Your presence is gift enough, but if you'd like to support us, we appreciate contributions towards our honeymoon registry."
                      rows={2}
                      value={form.registry_preferences ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, registry_preferences: e.target.value }))}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="registry-online"
                        checked={form.registry_online_contributions}
                        onChange={e => setForm(prev => ({ ...prev, registry_online_contributions: e.target.checked }))}
                        className="rounded bg-black border-white/10"
                      />
                      <label htmlFor="registry-online" className="text-xs text-parchment-400">Enable "Online Contributions Active" note banner</label>
                    </div>
                  </div>

                  {/* Streaming details */}
                  <div className="space-y-4 border-t border-white/10 pt-5">
                    <h3 className="text-sm font-bold text-white font-serif">📹 Virtual Ceremony Live Streaming</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="live-stream-active"
                        checked={form.live_stream_active}
                        onChange={e => setForm(prev => ({ ...prev, live_stream_active: e.target.checked }))}
                        className="rounded bg-black border-white/10"
                      />
                      <label htmlFor="live-stream-active" className="text-xs text-parchment-400 font-semibold">Enable Live Streaming Section on invitation</label>
                    </div>

                    {form.live_stream_active && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <Select
                          id="stream-platform"
                          label="Streaming Platform"
                          value={form.live_stream_platform ?? 'youtube'}
                          onChange={e => setForm(prev => ({ ...prev, live_stream_platform: e.target.value }))}
                          options={[
                            { value: 'youtube', label: 'YouTube Live' },
                            { value: 'facebook', label: 'Facebook Live' },
                            { value: 'zoom', label: 'Zoom Webinar' },
                          ]}
                        />
                        <Input
                          id="stream-url"
                          label="Live Stream Link / Video URL"
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          value={form.live_stream_url ?? ''}
                          onChange={e => setForm(prev => ({ ...prev, live_stream_url: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── GUEST MANAGER TAB ── */}
          {tab === 'guests' && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-lg font-serif text-white">Personalized Guest Invitations</h2>
                <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold rounded-full">
                  🌟 Premium Feature
                </span>
              </div>

              {isFeatureLocked('premium') ? (
                <div className="p-5 text-center border border-white/10 bg-black/25 rounded-sm space-y-3">
                  <p className="text-sm text-white font-medium">🔒 Guest Management is locked</p>
                  <p className="text-xs text-parchment-500 max-w-sm mx-auto">
                    Personalized links, guest checkin tracking, and RSVP list generation are locked on the Basic package.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setTab('payment')}>
                    Upgrade Plan in Activate Tab
                  </Button>
                </div>
              ) : !existingId ? (
                <div className="px-4 py-3 bg-amber-900/20 border border-amber-700/30 rounded-sm text-sm text-amber-400">
                  ⚠️ Please save your wedding details first before adding guests.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Add guest form */}
                  <form onSubmit={handleAddGuest} className="p-4 border border-white/5 bg-white/5 rounded-sm space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Generate Guest Invite Link</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Guest Name (e.g. Nimal Perera)"
                        value={newGuest.name}
                        onChange={e => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-rose-400 placeholder:text-parchment-700"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={newGuest.phone}
                        onChange={e => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                        className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-rose-400 placeholder:text-parchment-700"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={newGuest.email}
                        onChange={e => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-rose-400 placeholder:text-parchment-700"
                      />
                    </div>
                    
                    <Button type="submit" variant="secondary" className="w-full text-xs py-1.5 mt-2">
                      🔗 Generate Link
                    </Button>
                  </form>

                  {/* Guest list filter */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search guests..."
                      value={guestSearch}
                      onChange={e => setGuestSearch(e.target.value)}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Guest list table */}
                  {guestLoading ? (
                    <div className="text-center py-6 text-xs text-parchment-600">Loading guest records...</div>
                  ) : filteredGuests.length === 0 ? (
                    <div className="text-center py-6 text-xs text-parchment-600 italic">No guests match your query. Add them above!</div>
                  ) : (
                    <div className="overflow-x-auto max-h-96 border border-white/10 rounded-sm">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="bg-black/35 border-b border-white/10 text-white font-serif">
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Invite Link Status</th>
                            <th className="px-3 py-2">RSVP Response</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGuests.map((g, i) => (
                            <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="px-3 py-2.5 font-medium text-white">{g.name}</td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                  g.status === 'opened'
                                    ? 'bg-green-900/40 text-green-400 border border-green-800/30'
                                    : g.status === 'sent'
                                    ? 'bg-blue-900/40 text-blue-400 border border-blue-800/30'
                                    : 'bg-amber-900/40 text-amber-400 border border-amber-800/30'
                                }`}>
                                  {g.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                  g.rsvp_status === 'yes'
                                    ? 'bg-green-900/40 text-green-400 border border-green-800/30'
                                    : g.rsvp_status === 'no'
                                    ? 'bg-red-900/40 text-red-400 border border-red-800/30'
                                    : g.rsvp_status === 'maybe'
                                    ? 'bg-amber-900/40 text-amber-400 border border-amber-800/30'
                                    : 'bg-white/5 text-parchment-500 border border-white/10'
                                }`}>
                                  {g.rsvp_status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(g)}
                                  className="text-rose-400 hover:underline cursor-pointer"
                                >
                                  Copy Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyGuestMessage(g)}
                                  className="text-[#25D366] hover:underline cursor-pointer font-medium"
                                >
                                  WhatsApp Invite
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGuest(g.id)}
                                  className="text-red-500 hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TEMPLATE TAB ── */}
          {tab === 'template' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3 mb-5">Choose Your Template</h2>
              <TemplateSelector
                value={form.template_id}
                onChange={id => setForm(prev => ({ ...prev, template_id: id }))}
              />
            </div>
          )}

          {/* ── MEDIA TAB ── */}
          {tab === 'media' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3 mb-4">Media Uploads</h2>

              {/* ── Opening Animation Video (cover_url) ── */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-white block mb-0.5">
                    🎬 Opening Animation Video
                  </label>
                  <p className="text-[11px] text-parchment-500">
                    Plays first when a guest opens the invitation. Paste a YouTube / Vimeo link, or upload a video file.
                  </p>
                </div>

                {form.cover_url ? (
                  /* Preview */
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video max-w-sm rounded-sm overflow-hidden border border-white/10 bg-black">
                      {/youtu|vimeo/.test(form.cover_url) ? (
                        <iframe
                          src={form.cover_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="w-full h-full"
                          style={{ border: 'none' }}
                          allow="autoplay"
                          title="Opening video preview"
                        />
                      ) : (
                        <video src={form.cover_url} controls className="w-full h-full object-contain" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                        Opening Video ✓
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile('cover')}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow cursor-pointer"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Input panel */
                  <div className="border border-dashed border-rose-500/30 rounded-sm bg-rose-950/10 p-5 space-y-4">
                    {/* URL input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/80 uppercase tracking-wider">
                        🔗 Paste YouTube or Vimeo URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-sm text-xs text-white placeholder:text-parchment-700 focus:outline-none focus:border-rose-400"
                          onBlur={e => {
                            const val = e.target.value.trim()
                            if (val) setForm(prev => ({ ...prev, cover_url: val }))
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim()
                              if (val) setForm(prev => ({ ...prev, cover_url: val }))
                            }
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-parchment-600">YouTube, Vimeo, or any direct video URL — press Enter or click outside to apply</p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-[10px] text-parchment-600 uppercase tracking-widest">or upload a file</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* File upload */}
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        id="cover-video-upload"
                        className="hidden"
                        onChange={e => handleUpload(e, 'cover')}
                      />
                      <label
                        htmlFor="cover-video-upload"
                        className="cursor-pointer px-5 py-2.5 bg-rose-700/30 border border-rose-600/40 hover:bg-rose-700/50 rounded-sm text-sm font-medium text-white transition-all"
                      >
                        {uploading.cover ? `Uploading... ${uploading.cover}%` : '📤 Upload MP4 / WebM (max 50MB)'}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Music */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">Background Music (Audio)</label>
                {form.music_url ? (
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-sm max-w-md">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <p className="text-xs text-white font-medium">Background Music Active</p>
                        <audio src={form.music_url} controls className="h-8 mt-2 scale-90 -translate-x-4" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('music')}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow transition-all cursor-pointer"
                      title="Delete Music"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-sm p-6 hover:border-white/20 transition-all bg-black/10">
                    <span className="text-3xl mb-2">🎶</span>
                    <input
                      type="file"
                      accept="audio/*"
                      id="music-upload"
                      className="hidden"
                      onChange={e => handleUpload(e, 'music')}
                    />
                    <label
                      htmlFor="music-upload"
                      className="cursor-pointer px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-xs font-medium text-white transition-all"
                    >
                      {uploading.music ? `Uploading (${uploading.music}%)` : 'Upload Audio File'}
                    </label>
                    <p className="text-[10px] text-parchment-600 mt-2">Max size: 10MB (MP3, WAV, OGG)</p>
                  </div>
                )}
              </div>

              {/* ── Main Intro Video (video_url) ── */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-white block mb-0.5">
                    🎥 Main Intro Video (Title Animation)
                  </label>
                  <p className="text-[11px] text-parchment-500">
                    Auto-plays fullscreen after the opening animation. Paste a YouTube / Vimeo link, or upload a video file.
                  </p>
                </div>

                {form.video_url ? (
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video max-w-sm rounded-sm overflow-hidden border border-white/10 bg-black">
                      {/youtu|vimeo/.test(form.video_url) ? (
                        <iframe
                          src={form.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="w-full h-full"
                          style={{ border: 'none' }}
                          allow="autoplay"
                          title="Intro video preview"
                        />
                      ) : (
                        <video src={form.video_url} controls className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                        Intro Video ✓
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile('video')}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow cursor-pointer"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/15 rounded-sm bg-white/5 p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/80 uppercase tracking-wider">
                        🔗 Paste YouTube or Vimeo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-sm text-xs text-white placeholder:text-parchment-700 focus:outline-none focus:border-rose-400"
                        onBlur={e => {
                          const val = e.target.value.trim()
                          if (val) setForm(prev => ({ ...prev, video_url: val }))
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim()
                            if (val) setForm(prev => ({ ...prev, video_url: val }))
                          }
                        }}
                      />
                      <p className="text-[10px] text-parchment-600">YouTube, Vimeo, or direct URL — press Enter or click outside to apply</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-[10px] text-parchment-600 uppercase tracking-widest">or upload a file</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        id="video-upload"
                        className="hidden"
                        onChange={e => handleUpload(e, 'video')}
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-sm font-medium text-white transition-all"
                      >
                        {uploading.video ? `Uploading... ${uploading.video}%` : '📤 Upload MP4 / WebM (max 50MB)'}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white block">Photo Gallery (Max 8 images)</label>
                  <span className="text-xs text-parchment-500">{(form.gallery_urls ?? []).length} / 8 uploaded</span>
                </div>

                {(form.gallery_urls ?? []).length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {(form.gallery_urls ?? []).map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border border-white/10 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeleteFile('gallery', idx)}
                          className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-medium text-xs gap-1"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(form.gallery_urls ?? []).length < 8 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-sm p-6 hover:border-white/20 transition-all bg-black/10">
                    <span className="text-3xl mb-2">📸</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="gallery-upload"
                      className="hidden"
                      onChange={e => handleUpload(e, 'gallery')}
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="cursor-pointer px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm text-xs font-medium text-white transition-all"
                    >
                      {uploading.gallery ? `Uploading (${uploading.gallery}%)` : 'Upload Gallery Photos'}
                    </label>
                    <p className="text-[10px] text-parchment-600 mt-2">Up to 8 files, Max size: 5MB each (JPEG, PNG, WebP)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PAYMENT TAB ── */}
          {tab === 'payment' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-serif text-white border-b border-white/10 pb-3">Activate Your Invitation</h2>

              <div className="grid grid-cols-3 gap-3">
                {Object.entries(PACKAGES).map(([key, pkg]) => (
                  <button
                    key={key}
                    id={`package-${key}`}
                    type="button"
                    onClick={() => setSelectedPackage(key as any)}
                    className={`p-4 rounded-sm border text-left transition-all ${
                      selectedPackage === key
                        ? key === 'luxury'
                          ? 'border-yellow-600/70 bg-yellow-950/20'
                          : key === 'premium'
                          ? 'border-rose-600/60 bg-rose-900/20'
                          : 'border-white/30 bg-white/8'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    {key === 'luxury' && (
                      <span className="text-[9px] bg-yellow-700/20 text-yellow-300 border border-yellow-700/40 px-1.5 py-0.5 rounded-full block mb-2 w-fit font-bold uppercase tracking-wider">Luxury</span>
                    )}
                    {key === 'premium' && (
                      <span className="text-[9px] bg-rose-700/20 text-rose-300 border border-rose-700/40 px-1.5 py-0.5 rounded-full block mb-2 w-fit font-bold uppercase tracking-wider">Premium</span>
                    )}
                    {key === 'basic' && (
                      <span className="text-[9px] bg-white/10 text-white/70 border border-white/10 px-1.5 py-0.5 rounded-full block mb-2 w-fit font-bold uppercase tracking-wider">Basic</span>
                    )}
                    <p className="text-white font-medium capitalize text-sm">{pkg.name}</p>
                    <p className="text-lg font-bold text-white mt-1">Rs. {pkg.price.toLocaleString()}</p>
                    <p className="text-[9px] text-parchment-600 mt-0.5">LKR · One-time</p>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-sm text-xs space-y-3">
                <p className="font-bold text-white">Included Features by Package:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <p className="text-white font-medium">Basic</p>
                    <p className="text-[10px] text-parchment-500">✓ 3D envelope scene<br />✓ Music & Gallery<br />✓ Google Maps embed</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-rose-400 font-medium">Premium</p>
                    <p className="text-[10px] text-parchment-500">✓ Basic Package plus...<br />✓ RSVP Form System<br />✓ Guest link manager<br />✓ Admin Dashboard</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-yellow-400 font-medium">Luxury</p>
                    <p className="text-[10px] text-parchment-500">✓ Premium Package plus...<br />✓ Live stream player<br />✓ Gift registry<br />✓ Guest Photo Wall<br />✓ Photo Moderation</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-parchment-400">
                <p className="flex items-center gap-2"><span className="text-green-500">✓</span> Secure payment via PayHere</p>
                <p className="flex items-center gap-2"><span className="text-green-500">✓</span> Invitation published immediately after payment</p>
                <p className="flex items-center gap-2"><span className="text-green-500">✓</span> All features active for your wedding period</p>
              </div>

              {!existingId && (
                <div className="px-4 py-3 bg-amber-900/20 border border-amber-700/30 rounded-sm text-sm text-amber-400">
                  ⚠️ Please fill in your wedding details and save before activating.
                </div>
              )}

              <Button
                id="payhere-pay-btn"
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handlePayHere}
                disabled={!existingId}
              >
                Pay Rs. {PACKAGES[selectedPackage].price.toLocaleString()} with PayHere
              </Button>

              <p className="text-xs text-center text-parchment-700">
                Payments processed securely via PayHere · LKR only
              </p>

              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="p-4 rounded-sm border border-rose-500/20 bg-rose-950/10">
                  <h3 className="text-sm font-medium text-white mb-1">🛠️ Testing & Demo Mode</h3>
                  <p className="text-xs text-parchment-500 mb-3">
                    Want to test the invitation link and RSVP system? You can activate the Free Demo Version instantly without payment.
                  </p>
                  <Button
                    id="free-activate-btn"
                    variant="secondary"
                    className="w-full text-xs py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300"
                    onClick={handleFreeActivate}
                    disabled={!existingId}
                    loading={freeLoading}
                  >
                    🚀 Activate Free Test Version (Instant Publish with {PACKAGES[selectedPackage].name} Package)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: 3D Preview */}
        <div className="space-y-4">
          <div className="glass-card overflow-hidden" style={{ height: '480px' }}>
            <div className="relative h-full">
              <InvitationScene
                template={previewTemplate}
                burstMode={false}
                className="w-full h-full"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-parchment-500 pointer-events-none">
                Live 3D Preview · Click to interact
              </div>
            </div>
          </div>

          {/* Preview info card */}
          {form.partner1_name && form.partner2_name && (
            <div className="glass-card p-4 text-center">
              <p className="font-serif text-2xl text-white">
                {form.partner1_name} <span className="text-rose-400">&</span> {form.partner2_name}
              </p>
              {form.wedding_date && (
                <p className="text-sm text-parchment-400 mt-1">
                  {new Date(form.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              {form.venue_name && (
                <p className="text-xs text-parchment-600 mt-1">{form.venue_name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
