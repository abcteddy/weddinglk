'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { TEMPLATES } from '@/lib/templates'
import { generateSlug } from '@/lib/utils/slug'
import { Invitation, TimelineEvent, BuilderConfig, SectionConfig, TemplateConfig } from '@/types/invitation'
import { PACKAGES } from '@/lib/payhere'
import { GoogleFontLoader } from '@/components/ui/GoogleFontLoader'
import { resolveVideo } from '@/lib/utils/videoEmbed'

const DEFAULT_BUILDER_CONFIG: BuilderConfig = {
  global: {
    primaryFont: 'Playfair Display',
    secondaryFont: 'Montserrat',
    primaryColor: '#ffffff',
    accentColor: '#D4AF37',
    bgMusicUrl: '',
    bgType: 'color',
    bgUrl: '',
    bgColor: '#0b0b0f'
  },
  sections: [
    {
      id: 'open-animation',
      type: 'open',
      title: 'Open Animation',
      visible: true,
      styles: {
        bgType: 'video',
        bgUrl: '',
        bgOverlayOpacity: 60,
        bgOverlayColor: '#000000',
        fontFamily: 'Great Vibes',
        textColor: '#D4AF37',
        paddingTop: 120,
        paddingBottom: 120,
        borderRadius: 16,
        boxShadow: true
      },
      content: {
        title: 'Together with their families',
        subtitle: 'Invite you to celebrate their wedding',
        buttonText: 'Click to Open'
      }
    },
    {
      id: 'intro-animation',
      type: 'intro',
      title: 'Intro Animation',
      visible: true,
      styles: {
        bgType: 'video',
        bgUrl: '',
        bgOverlayOpacity: 40,
        bgOverlayColor: '#000000',
        fontFamily: 'Playfair Display',
        textColor: '#ffffff',
        paddingTop: 100,
        paddingBottom: 100,
        borderRadius: 0,
        boxShadow: false
      },
      content: {
        title: 'Our Story',
        subtitle: 'Moments to Remember'
      }
    },
    {
      id: 'details-section',
      type: 'details',
      title: 'Details Section',
      visible: true,
      styles: {
        bgType: 'color',
        bgColor: '#0b0b0f',
        fontFamily: 'Playfair Display',
        textColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
        borderRadius: 8,
        boxShadow: true
      },
      content: {
        title: 'Wedding Details',
        subtitle: 'The Celebration'
      }
    },
    {
      id: 'gallery-section',
      type: 'gallery',
      title: 'Gallery Section',
      visible: true,
      styles: {
        bgType: 'color',
        bgColor: '#0b0b0f',
        fontFamily: 'Playfair Display',
        textColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
        borderRadius: 8,
        boxShadow: true
      },
      content: {
        title: 'Our Moments',
        subtitle: 'Sweet Memories'
      }
    },
    {
      id: 'rsvp-section',
      type: 'rsvp',
      title: 'RSVP Section',
      visible: true,
      styles: {
        bgType: 'color',
        bgColor: '#0b0b0f',
        fontFamily: 'Playfair Display',
        textColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
        borderRadius: 8,
        boxShadow: true
      },
      content: {
        title: 'Kindly Respond',
        subtitle: 'Join Our Celebration'
      }
    },
    {
      id: 'footer-section',
      type: 'footer',
      title: 'Footer Section',
      visible: true,
      styles: {
        bgType: 'color',
        bgColor: '#080808',
        fontFamily: 'Montserrat',
        textColor: '#a3a3a3',
        paddingTop: 60,
        paddingBottom: 60,
        borderRadius: 0,
        boxShadow: false
      },
      content: {
        title: 'Thank You',
        subtitle: 'Made with love'
      }
    }
  ]
}

type Tab = 'templates' | 'sections' | 'styles' | 'content' | 'photos' | 'animations' | 'settings'
type RightTab = 'content' | 'style' | 'animation'
type Viewport = 'desktop' | 'tablet' | 'mobile'

const GOOGLE_FONTS = [
  'Inter',
  'Montserrat',
  'Playfair Display',
  'Great Vibes',
  'Alex Brush',
  'Cinzel',
  'Rochester',
  'Cormorant Garamond',
  'Pinyon Script',
  'Outfit',
  'Italianno',
  'Sacramento',
  'Parisienne'
]

export default function BuilderPage() {
  const router = useRouter()
  const supabase = createClient()

  // App layouts states
  const [activeTab, setActiveTab] = useState<Tab>('templates')
  const [activeRightTab, setActiveRightTab] = useState<RightTab>('style')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [activeSectionId, setActiveSectionId] = useState<string>('open-animation')
  const [previewMode, setPreviewMode] = useState<'section' | 'full'>('section')

  // Save loading
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

  // Core Structured Form State
  const [form, setForm] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_date: '',
    wedding_time: '6:00 PM',
    venue_name: '',
    venue_address: '',
    rsvp_deadline: '',
    template_id: 'classic',
    custom_message: '',
    couple_phone: '',
    cover_url: '',
    photo_url: '',
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

  // Builder Config State
  const [builderConfig, setBuilderConfig] = useState<BuilderConfig>(DEFAULT_BUILDER_CONFIG)

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
          template_id: data.template_id ?? 'classic',
          custom_message: data.custom_message ?? '',
          couple_phone: (data as any).couple_phone ?? '',
          cover_url: data.cover_url ?? '',
          photo_url: data.photo_url ?? '',
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

        // Initialize Builder Config
        if (data.builder_config) {
          // Merge with default config to ensure missing keys are present
          const mergedConfig = {
            global: { ...DEFAULT_BUILDER_CONFIG.global, ...data.builder_config.global },
            sections: DEFAULT_BUILDER_CONFIG.sections.map(defSec => {
              const matchingSec = data.builder_config?.sections.find(s => s.id === defSec.id)
              return matchingSec ? {
                ...defSec,
                ...matchingSec,
                styles: { ...defSec.styles, ...matchingSec.styles },
                content: { ...defSec.content, ...matchingSec.content }
              } : defSec
            })
          }
          setBuilderConfig(mergedConfig)
        } else {
          // Initialize default configurations with cover_url & video_url if they exist
          const initializedConfig = {
            ...DEFAULT_BUILDER_CONFIG,
            sections: DEFAULT_BUILDER_CONFIG.sections.map(sec => {
              if (sec.id === 'open-animation') {
                return { ...sec, styles: { ...sec.styles, bgUrl: data.cover_url ?? '' } }
              }
              if (sec.id === 'intro-animation') {
                return { ...sec, styles: { ...sec.styles, bgUrl: data.video_url ?? '' } }
              }
              return sec
            })
          }
          setBuilderConfig(initializedConfig)
        }
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

  // Load guest list if Settings/Guests manager tab is active
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
    if (activeTab === 'settings' && existingId) {
      loadGuests()
    }
  }, [activeTab, existingId, supabase])

  // Get active section styles & content
  const activeSection = builderConfig.sections.find(s => s.id === activeSectionId) || builderConfig.sections[0]

  const handleUpdateSectionStyle = (key: string, value: any) => {
    setBuilderConfig(prev => ({
      ...prev,
      sections: prev.sections.map(sec => 
        sec.id === activeSectionId 
          ? { ...sec, styles: { ...sec.styles, [key]: value } }
          : sec
      )
    }))
  }

  const handleUpdateSectionContent = (key: string, value: any) => {
    setBuilderConfig(prev => ({
      ...prev,
      sections: prev.sections.map(sec => 
        sec.id === activeSectionId 
          ? { ...sec, content: { ...sec.content, [key]: value } }
          : sec
      )
    }))
  }

  const handleUpdateGlobalStyle = (key: string, value: any) => {
    setBuilderConfig(prev => ({
      ...prev,
      global: { ...prev.global, [key]: value }
    }))
  }

  // Preset Template loader
  const handleApplyPreset = (presetId: string) => {
    const config = TEMPLATES[presetId]
    if (!config) return

    setBuilderConfig(prev => {
      // Create new config set
      return {
        global: {
          ...prev.global,
          primaryFont: config.fontFamily,
          accentColor: config.accentColor,
          primaryColor: config.textColor
        },
        sections: prev.sections.map(sec => {
          // Apply font and text styles based on preset
          const updatedStyles = {
            ...sec.styles,
            fontFamily: config.fontFamily,
            textColor: config.textColor
          }

          if (presetId === 'royalRose') {
            updatedStyles.bgColor = '#290109'
            updatedStyles.bgOverlayColor = '#000000'
          } else if (presetId === 'goldenLove') {
            updatedStyles.bgColor = '#f7f5f2'
            updatedStyles.textColor = '#705b45'
            updatedStyles.bgOverlayColor = '#ffffff'
          } else if (presetId === 'elegantWhite') {
            updatedStyles.bgColor = '#ffffff'
            updatedStyles.textColor = '#3a3a3a'
          } else if (presetId === 'glitterGold') {
            updatedStyles.bgColor = '#110d06'
            updatedStyles.textColor = '#D4AF37'
          } else if (presetId === 'greenery') {
            updatedStyles.bgColor = '#f4fbf7'
            updatedStyles.textColor = '#1d3f2a'
          } else if (presetId === 'lavenderDreams') {
            updatedStyles.bgColor = '#fbf8ff'
            updatedStyles.textColor = '#5a4666'
          }

          return {
            ...sec,
            styles: updatedStyles
          }
        })
      }
    })

    setForm(prev => ({ ...prev, template_id: presetId }))
    setSuccess(`Applied ${config.name} theme preset!`)
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleSave = async (shouldPublish?: boolean) => {
    setSaveLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!form.wedding_date) throw new Error('Please select a wedding date')

      const slug = generateSlug(form.partner1_name, form.partner2_name, new Date(form.wedding_date).getFullYear())

      // Get background URLs from open and intro animations
      const coverUrl = builderConfig.sections.find(s => s.type === 'open')?.styles.bgUrl || form.cover_url
      const videoUrl = builderConfig.sections.find(s => s.type === 'intro')?.styles.bgUrl || form.video_url

      const payload: any = {
        ...form,
        cover_url: coverUrl,
        video_url: videoUrl,
        rsvp_deadline: form.rsvp_deadline || null,
        slug,
        user_id: user.id,
        package: selectedPackage,
        builder_config: builderConfig
      }

      if (shouldPublish) {
        payload.is_published = true
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
      setSuccess(shouldPublish ? 'All builder progress saved and published successfully!' : 'All builder progress saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('[Save Error]:', err)
      let msg = 'Failed to save'
      if (err) {
        if (typeof err === 'string') {
          msg = err
        } else if (err.message) {
          msg = err.message
          if (err.details) msg += ` (${err.details})`
          if (err.hint) msg += ` [Hint: ${err.hint}]`
          if (err.code) msg += ` [Code: ${err.code}]`
        } else {
          try {
            msg = JSON.stringify(err)
          } catch (e) {
            msg = String(err)
          }
        }
      }
      setError(msg)
    } finally {
      setSaveLoading(false)
    }
  }

  // Upload handler updated for builder section backgrounds
  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'cover' | 'music' | 'video' | 'gallery' | 'groom_photo' | 'bride_photo' | 'photo' | 'registry_qr' | 'bg_url' | 'global_bg_url') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to upload files')
      return
    }

    const type = fieldName === 'bg_url' 
      ? (activeSection.type === 'open' ? 'cover' : 'video') 
      : (fieldName === 'global_bg_url' ? 'global_bg' : fieldName)

    const uploadSingle = async (file: File, skipStateUpdate = false) => {
      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 10)
      const filePath = `${user.id}/${type}_${randomId}.${fileExt}`

      if (!skipStateUpdate) {
        setUploading(prev => ({ ...prev, [type]: 10 }))
      }

      const { error: uploadError } = await supabase.storage
        .from('wedding-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      if (!skipStateUpdate) {
        setUploading(prev => ({ ...prev, [type]: 100 }))
        setTimeout(() => {
          setUploading(prev => {
            const next = { ...prev }
            delete next[type]
            return next
          })
        }, 1000)
      }

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

        setUploading(prev => ({ ...prev, gallery: 10 }))

        const urls: string[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.size > 15 * 1024 * 1024) {
            throw new Error(`File "${file.name}" is too large. Max size is 15MB.`)
          }
          const url = await uploadSingle(file, true)
          urls.push(url)
        }

        setForm(prev => ({
          ...prev,
          gallery_urls: [...(prev.gallery_urls ?? []), ...urls]
        }))

        setUploading(prev => ({ ...prev, gallery: 100 }))
        setTimeout(() => {
          setUploading(prev => {
            const next = { ...prev }
            delete next.gallery
            return next
          })
        }, 1000)
      } else {
        const file = files[0]
        const sizeLimit = (type === 'video' || type === 'cover') ? 50 * 1024 * 1024 : 15 * 1024 * 1024
        const sizeLimitStr = (type === 'video' || type === 'cover') ? '50MB' : '15MB'
        if (file.size > sizeLimit) {
          throw new Error(`File size is too large. Max size is ${sizeLimitStr}`)
        }

        const url = await uploadSingle(file)
        if (fieldName === 'bg_url') {
          handleUpdateSectionStyle('bgUrl', url)
        } else if (fieldName === 'global_bg_url') {
          handleUpdateGlobalStyle('bgUrl', url)
        } else {
          setForm(prev => ({
            ...prev,
            [`${type}_url`]: url
          }))
        }
      }
      setSuccess(`${type.toUpperCase()} uploaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.message || `Failed to upload ${type}`)
      setUploading(prev => {
        const next = { ...prev }
        delete next[type]
        return next
      })
    }
  }

  // Delete file action
  const handleDeleteFile = async (type: 'cover' | 'music' | 'video' | 'gallery' | 'groom_photo' | 'bride_photo' | 'photo' | 'registry_qr', index?: number) => {
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
    } catch (err: any) {
      setError(err?.message || 'Failed to remove file')
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
    setSuccess('Event added to timeline!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleDeleteTimelineEvent = (index: number) => {
    const updatedEvents = [...(form.timeline_events ?? [])]
    updatedEvents.splice(index, 1)
    setForm(prev => ({ ...prev, timeline_events: updatedEvents }))
  }

  // Payment triggers
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
    } catch (err: any) {
      setError(err?.message || 'Failed to activate free test version')
    } finally {
      setFreeLoading(false)
    }
  }

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
    (g.phone && g.phone.includes(guestSearch)) ||
    (g.email && g.email.toLowerCase().includes(guestSearch.toLowerCase()))
  )

  const activeSectionStyle = activeSection.styles

  // Collect all fonts being used in builder for Google Fonts Loader
  const activeFonts = [
    builderConfig.global.primaryFont,
    builderConfig.global.secondaryFont,
    ...builderConfig.sections.map(s => s.styles.fontFamily)
  ].filter(Boolean) as string[]

  const renderSectionPreview = (sectionId: string, isFullPage: boolean) => {
    const sec = builderConfig.sections.find(s => s.id === sectionId)
    if (!sec || (!sec.visible && isFullPage)) return null

    const secStyle = sec.styles
    const isMainOpen = sectionId === 'open-animation'
    const isIntro = sectionId === 'intro-animation'
    const isDetails = sectionId === 'details-section'
    const isGallery = sectionId === 'gallery-section'
    const isRsvp = sectionId === 'rsvp-section'
    const isFooter = sectionId === 'footer-section'

    const introSection = builderConfig.sections.find(s => s.type === 'intro')
    const showIntroLoopOnDetails = isDetails && introSection?.content.loopAtTop && (introSection.styles.bgUrl || form.video_url)

    // Resolve bg media for open and intro (or details if looping intro video is enabled)
    const videoInfo = (isMainOpen || isIntro) && secStyle.bgType === 'video' && secStyle.bgUrl 
      ? resolveVideo(secStyle.bgUrl, { autoplay: true, muted: true, loop: true, controls: false }) 
      : (showIntroLoopOnDetails
          ? resolveVideo(introSection.styles.bgUrl || form.video_url || '', { autoplay: true, muted: true, loop: true, controls: false })
          : null);

    return (
      <div 
        key={sectionId}
        onClick={() => {
          if (isFullPage) {
            setActiveSectionId(sectionId)
          }
        }}
        className={`relative w-full transition-all duration-200 group ${
          isFullPage ? 'cursor-pointer border-b border-slate-800/40 hover:outline hover:outline-1 hover:outline-rose-500/50' : 'h-full flex flex-col justify-center'
        } ${
          isFullPage && activeSectionId === sectionId ? 'outline outline-2 outline-rose-500 z-10' : ''
        }`}
        style={{
          backgroundColor: (builderConfig.global.bgType === 'image' || builderConfig.global.bgColor) && !['open', 'intro'].includes(sec.type)
            ? 'transparent'
            : secStyle.bgColor || (isFooter ? '#080808' : '#0b0b0f'),
          color: secStyle.textColor || (isFooter ? '#a3a3a3' : '#ffffff'),
          paddingTop: isFullPage ? `${Math.max((secStyle.paddingTop ?? 80) / 2, 40)}px` : `${secStyle.paddingTop ?? 80}px`,
          paddingBottom: isFullPage ? `${Math.max((secStyle.paddingBottom ?? 80) / 2, 40)}px` : `${secStyle.paddingBottom ?? 80}px`,
          backgroundImage: secStyle.bgType === 'image' && secStyle.bgUrl ? `url(${secStyle.bgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isFullPage ? (['open', 'intro'].includes(sec.type) ? '55vh' : 'auto') : '100%'
        }}
      >
        {/* Render backgrounds for video types */}
        {((secStyle.bgType === 'video' && secStyle.bgUrl) || showIntroLoopOnDetails) && (
          videoInfo ? (
            videoInfo.type === 'direct' ? (
              <video src={videoInfo.embedUrl} className="absolute inset-0 object-cover w-full h-full pointer-events-none" autoPlay loop muted playsInline />
            ) : (
              <iframe
                src={videoInfo.embedUrl}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.35] origin-center"
                allow="autoplay; mute"
              />
            )
          ) : null
        )}

        {/* Overlay Color for media types */}
        {((['video', 'image'].includes(secStyle.bgType || '')) || showIntroLoopOnDetails) && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: showIntroLoopOnDetails ? '#000000' : (secStyle.bgOverlayColor || '#000000'),
              opacity: showIntroLoopOnDetails 
                ? ((introSection?.styles.bgOverlayOpacity ?? 50) / 100)
                : ((secStyle.bgOverlayOpacity ?? 50) / 100)
            }}
          />
        )}

        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4">
          {isMainOpen && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              <div />
              {!sec.content.hideOverlay && (
                <div 
                  className="w-full flex flex-col items-center text-center px-2"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${secStyle.overlayY !== undefined ? secStyle.overlayY : 45}%`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className="max-w-md space-y-4 pointer-events-none p-4" style={{
                    borderRadius: `${secStyle.borderRadius || 0}px`,
                    boxShadow: secStyle.boxShadow ? '0 10px 50px rgba(0,0,0,0.8)' : 'none'
                  }}>
                    <div className="border border-[#D4AF37]/30 p-8 rounded-xl bg-black/45 backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.4em] mb-2 preview-font-secondary" style={{ color: secStyle.textColor || '#D4AF37' }}>
                        {sec.content.title || 'Together with their families'}
                      </p>
                      <h1 className="text-3xl font-bold tracking-wide leading-relaxed" style={{ 
                        color: secStyle.titleColor || secStyle.textColor || '#D4AF37',
                        fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif` 
                      }}>
                        {form.partner1_name || 'Groom'} <span className="text-xl">&amp;</span> {form.partner2_name || 'Bride'}
                      </h1>
                      <p className="text-[10px] mt-3 tracking-widest leading-relaxed opacity-75 preview-font-secondary" style={{ color: secStyle.subtitleColor || secStyle.textColor || '#ffffff' }}>
                        {sec.content.subtitle || 'Invite you to celebrate their wedding'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="self-center mt-auto">
                <button className="px-5 py-2.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-[#D4AF37]/80 text-slate-950 shadow-md">
                  {sec.content.buttonText || 'Click to Open'}
                </button>
              </div>
            </div>
          )}

          {isIntro && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              <div />
              <div 
                className="w-full flex flex-col items-center text-center px-2"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${secStyle.overlayY !== undefined ? secStyle.overlayY : 75}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                {sec.content.hideOverlay ? (
                  <div className="text-[10px] text-rose-400 font-medium italic py-1 px-3 bg-black/40 rounded-full border border-slate-800/80">
                    [Overlay text is hidden on video screen]
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest preview-font-secondary" style={{ color: secStyle.subtitleColor || secStyle.textColor || '#ffffff', opacity: 0.85 }}>
                      {sec.content.subtitle || 'Intro Showcase'}
                    </p>
                    <h1 className="text-xl tracking-wider font-bold uppercase" style={{ 
                      color: secStyle.titleColor || secStyle.textColor || '#D4AF37',
                      fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
                    }}>
                      {sec.content.title || 'OUR MOVIE INTRO'}
                    </h1>
                  </div>
                )}
              </div>
              <div className="self-center mt-auto">
                <span className="text-[10px] bg-black/40 text-slate-400 px-3 py-1 rounded-full border border-slate-800 inline-block">
                  🎬 Video Timeline: 00:03 / 00:08
                </span>
              </div>
            </div>
          )}

          {isDetails && (
            <div className="w-full max-w-sm mx-auto space-y-6 text-center border border-slate-800/80 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md" style={{
              borderRadius: `${secStyle.borderRadius || 12}px`,
              boxShadow: secStyle.boxShadow ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
            }}>
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold preview-font-secondary" style={{ color: secStyle.subtitleColor || secStyle.textColor || '#rose-400' }}>Celebrate With Us</span>
              <h2 className="text-2xl font-bold leading-snug" style={{ 
                color: secStyle.titleColor || secStyle.textColor || '#ffffff',
                fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
              }}>
                {sec.content.title || 'Wedding Invitation'}
              </h2>
              <div className="h-0.5 w-12 mx-auto bg-rose-500/50"></div>
              
              <div className="space-y-4 text-xs font-light tracking-wide leading-relaxed">
                <p className="preview-font-secondary" style={{ color: secStyle.textColor || '#ffffff' }}>
                  {sec.content.subtitle || 'We joyfully request the pleasure of your company'}
                </p>
                
                <div className="py-2">
                  <div className="text-lg font-bold" style={{ 
                    color: secStyle.titleColor || builderConfig.global.accentColor || '#D4AF37',
                    fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
                  }}>
                    {form.partner1_name || 'Kamal'}
                  </div>
                  <div className="text-xs text-slate-500 my-1 font-serif">&amp;</div>
                  <div className="text-lg font-bold" style={{ 
                    color: secStyle.titleColor || builderConfig.global.accentColor || '#D4AF37',
                    fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
                  }}>
                    {form.partner2_name || 'Nisha'}
                  </div>
                </div>

                <div className="border-t border-b border-slate-800/60 py-3 space-y-1">
                  <div className="font-bold uppercase tracking-widest preview-font-secondary text-[10px]" style={{ color: secStyle.subtitleColor || secStyle.textColor || '#f43f5e' }}>
                    {form.wedding_date ? new Date(form.wedding_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not set'}
                  </div>
                  <div className="text-slate-400 preview-font-secondary text-[10px]" style={{ color: secStyle.textColor || '#94a3b8' }}>
                    Time: {form.wedding_time}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-slate-300 preview-font-secondary text-[11px]" style={{ color: secStyle.textColor || '#cbd5e1' }}>{form.venue_name || 'Venue'}</div>
                  <div className="text-slate-500 text-[10px] preview-font-secondary" style={{ color: secStyle.textColor || '#64748b' }}>{form.venue_address || 'Address'}</div>
                </div>
              </div>
            </div>
          )}

          {isGallery && (
            <div className="w-full max-w-sm mx-auto space-y-6 text-center border border-slate-800/80 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md" style={{
              borderRadius: `${secStyle.borderRadius || 12}px`,
              boxShadow: secStyle.boxShadow ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
            }}>
              <span className="text-[9px] uppercase tracking-[0.35em] mb-1 preview-font-secondary" style={{ color: secStyle.subtitleColor || secStyle.textColor || builderConfig.global.accentColor || '#D4AF37' }}>
                {sec.content.subtitle || 'Our Moments'}
              </span>
              <h2 className="text-2xl font-bold leading-snug" style={{ 
                color: secStyle.titleColor || secStyle.textColor || '#ffffff',
                fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
              }}>
                {sec.content.title || 'Photo Gallery'}
              </h2>
              <div className="h-px w-16 bg-white/20 mx-auto my-3" />
              
              {form.gallery_urls && form.gallery_urls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {form.gallery_urls.slice(0, 4).map((url, i) => (
                    <div key={i} className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-white/5">
                      <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center border border-dashed border-slate-700/60 text-slate-500 text-[10px]">
                      Photo {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isRsvp && (
            <div className="w-full max-w-sm mx-auto space-y-6 border border-slate-800/80 p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md" style={{
              borderRadius: `${secStyle.borderRadius || 12}px`,
              boxShadow: secStyle.boxShadow ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
            }}>
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-[0.35em] mb-1 preview-font-secondary" style={{ color: secStyle.subtitleColor || secStyle.textColor || builderConfig.global.accentColor || '#D4AF37' }}>
                  {sec.content.subtitle || 'Join Our Celebration'}
                </span>
                <h2 className="text-2xl font-bold leading-snug" style={{ 
                  color: secStyle.titleColor || secStyle.textColor || '#ffffff',
                  fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
                }}>
                  {sec.content.title || 'Kindly Respond'}
                </h2>
                <div className="h-px w-16 bg-white/20 mx-auto my-3" />
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Your Name</label>
                  <input type="text" disabled placeholder="Guest Name" className="w-full text-xs bg-[#12161e]/85 border border-slate-800 rounded-lg p-2.5 text-slate-300" />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Will you attend?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">Attending</button>
                    <button type="button" className="py-2 rounded-lg bg-[#12161e]/85 border border-slate-800 text-slate-500 text-xs">Declining</button>
                  </div>
                </div>

                <button type="button" className="w-full py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider text-slate-950 shadow-md transition-all cursor-not-allowed" style={{ backgroundColor: builderConfig.global.accentColor || '#D4AF37' }}>
                  Submit Response
                </button>
              </div>
            </div>
          )}

          {isFooter && (
            <div className="max-w-sm mx-auto space-y-4 p-8 border border-slate-850 rounded-xl bg-slate-900/30" style={{
              borderRadius: `${secStyle.borderRadius || 12}px`,
              boxShadow: secStyle.boxShadow ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
            }}>
              <span className="text-xl">💍</span>
              <h2 className="text-2xl font-bold leading-snug" style={{ 
                color: secStyle.titleColor || secStyle.textColor || '#ffffff',
                fontFamily: `'${secStyle.fontFamily || builderConfig.global.primaryFont}', serif`
              }}>
                {sec.content.title || 'Thank You'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed preview-font-secondary" style={{ color: secStyle.textColor || '#94a3b8' }}>
                {sec.content.subtitle || 'We are excited to share our special day with you!'}
              </p>
              <p className="text-[10px] tracking-widest uppercase preview-font-secondary mt-2" style={{ color: secStyle.subtitleColor || secStyle.textColor || '#f43f5e' }}>
                {form.partner1_name || 'Groom'} &amp; {form.partner2_name || 'Bride'}
              </p>
            </div>
          )}
        </div>

        {/* Focus indicator / section label when in Full page scroll */}
        {isFullPage && (
          <div className="absolute top-2 right-2 bg-black/60 border border-slate-850 rounded px-2 py-0.5 text-[8px] uppercase tracking-wider text-slate-400 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {sec.title} {activeSectionId === sectionId ? '● Editing' : ''}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0f14]">
        <div className="text-rose-400 font-serif text-lg animate-pulse">Loading builder configuration...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#090b0e] text-slate-200 overflow-hidden font-sans select-none flex-1">
      {/* Load dynamic google fonts */}
      <GoogleFontLoader fonts={activeFonts} />

      {/* ── LEFT ICON SIDEBAR ── */}
      <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 md:gap-6 bg-[#0c0f13] border-b md:border-b-0 md:border-r border-slate-800/80 p-3 md:py-6 w-full md:w-[70px] z-20 shrink-0">
        <div className="font-serif text-rose-500 text-xl font-bold tracking-wider hidden md:block select-none mb-4 cursor-pointer" onClick={() => router.push('/dashboard')}>IC</div>
        
        <div className="flex md:flex-col items-center gap-1.5 md:gap-3 w-full">
          {[
            { id: 'templates', label: 'Templates', icon: '🎨' },
            { id: 'sections', label: 'Sections', icon: '📋' },
            { id: 'styles', label: 'Styles', icon: '✨' },
            { id: 'content', label: 'Content', icon: '✍️' },
            { id: 'photos', label: 'Photos', icon: '🖼️' },
            { id: 'animations', label: 'Timeline', icon: '⏳' },
            { id: 'settings', label: 'Guests', icon: '👥' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={`flex flex-col items-center gap-1 w-full p-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-rose-500/10 border border-rose-500/25 text-rose-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold scale-90">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto hidden md:block">
          <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer">
            🏠
          </button>
        </div>
      </div>

      {/* ── LEFT DETAIL PANEL (Accordion-like sidebar based on active tab) ── */}
      <div className="w-full md:w-[320px] bg-[#0c0f13]/90 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col z-10 shrink-0 select-none overflow-y-auto max-h-[40vh] md:max-h-full">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-slate-300">
            {activeTab.toUpperCase()}
          </h2>
          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono font-bold uppercase scale-90">Builder Pro</span>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* TAB 1: TEMPLATE PRESETS */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Select a curated visual design template. Applying a preset configures colors, typography layouts, and spacings instantly.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.values(TEMPLATES).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyPreset(tmpl.id)}
                    className={`group relative rounded-xl border p-2 text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      form.template_id === tmpl.id
                        ? 'border-rose-500/60 bg-rose-500/[0.04]'
                        : 'border-slate-800 bg-[#12161e] hover:border-slate-700'
                    }`}
                  >
                    <div className="h-16 w-full rounded-lg mb-2 flex items-center justify-center overflow-hidden" style={{ background: tmpl.previewGradient }}>
                      <span className="text-xs font-serif font-bold text-white tracking-widest">{tmpl.name.substring(0, 1)}</span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[11px] font-medium text-slate-300 truncate w-[75%]">{tmpl.name}</span>
                      {tmpl.isPremium && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded uppercase font-semibold font-mono leading-none">Pro</span>}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="secondary" className="w-full text-xs py-2 rounded-xl" onClick={() => {
                  setBuilderConfig(DEFAULT_BUILDER_CONFIG)
                  setSuccess('Reset to default blank configurations!')
                  setTimeout(() => setSuccess(''), 2000)
                }}>
                  Create Blank Template
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS CHECKLIST & ORDER */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Toggle section visibility and configure order. Tap a section to navigate to it directly in the style customizer.</p>
              
              <div className="space-y-2">
                {builderConfig.sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      activeSectionId === sec.id
                        ? 'border-rose-500 bg-rose-500/5'
                        : 'border-slate-800 bg-[#12161e] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-rose-400/80">{idx + 1}</span>
                      <div>
                        <div className="text-xs font-medium text-slate-200">{sec.title}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{sec.styles.bgType} Background</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setBuilderConfig(prev => ({
                            ...prev,
                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, visible: !s.visible } : s)
                          }))
                        }}
                        className={`text-sm cursor-pointer p-1 rounded hover:bg-slate-800 ${sec.visible ? 'text-rose-400' : 'text-slate-600'}`}
                      >
                        {sec.visible ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL STYLES */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300">Global Fonts</h3>
              <div className="space-y-3">
                <Select
                  label="Primary Script Font"
                  value={builderConfig.global.primaryFont}
                  onChange={e => handleUpdateGlobalStyle('primaryFont', e.target.value)}
                  options={GOOGLE_FONTS.map(f => ({ value: f, label: f }))}
                />
                <Select
                  label="Secondary Text Font"
                  value={builderConfig.global.secondaryFont}
                  onChange={e => handleUpdateGlobalStyle('secondaryFont', e.target.value)}
                  options={GOOGLE_FONTS.map(f => ({ value: f, label: f }))}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">Global Color Palette</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={builderConfig.global.accentColor}
                      onChange={e => handleUpdateGlobalStyle('accentColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono">{builderConfig.global.accentColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-1">Text Color</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={builderConfig.global.primaryColor}
                      onChange={e => handleUpdateGlobalStyle('primaryColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono">{builderConfig.global.primaryColor}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">Background Music</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="music-upload"
                  accept="audio/*"
                  onChange={e => handleUploadBg(e, 'music')}
                  className="hidden"
                />
                {form.music_url ? (
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800/60 p-2.5 rounded-xl">
                    <div className="truncate text-xs text-rose-300 font-mono w-[80%]">🎵 Music Active</div>
                    <button
                      onClick={() => handleDeleteFile('music')}
                      className="text-xs hover:text-red-400 p-1 cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full text-xs py-2"
                    onClick={() => document.getElementById('music-upload')?.click()}
                    loading={!!uploading.music}
                  >
                    🎵 Upload Background Audio
                  </Button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">Global Page Background</h3>
              <div className="space-y-3">
                <Select
                  label="Background Type"
                  value={builderConfig.global.bgType || 'color'}
                  onChange={e => handleUpdateGlobalStyle('bgType', e.target.value)}
                  options={[
                    { value: 'color', label: 'Solid Color' },
                    { value: 'image', label: 'Background Image' }
                  ]}
                />

                {builderConfig.global.bgType === 'image' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Background Image</label>
                    <input
                      type="file"
                      id="global-bg-upload"
                      accept="image/*"
                      onChange={e => handleUploadBg(e, 'global_bg_url')}
                      className="hidden"
                    />
                    {builderConfig.global.bgUrl ? (
                      <div className="flex items-center justify-between bg-slate-900 border border-slate-800/60 p-2.5 rounded-xl">
                        <div className="truncate text-xs text-rose-300 font-mono w-[80%]">🖼️ Image Configured</div>
                        <button
                          onClick={() => handleUpdateGlobalStyle('bgUrl', '')}
                          className="text-xs hover:text-red-400 p-1 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full text-xs py-2"
                        onClick={() => document.getElementById('global-bg-upload')?.click()}
                        loading={!!uploading.global_bg}
                      >
                        🖼️ Upload Background Image
                      </Button>
                    )}
                    
                    <Input
                      label="Or Image URL"
                      placeholder="https://example.com/image.jpg"
                      value={builderConfig.global.bgUrl || ''}
                      onChange={e => handleUpdateGlobalStyle('bgUrl', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                      <input
                        type="color"
                        value={builderConfig.global.bgColor || '#0b0b0f'}
                        onChange={e => handleUpdateGlobalStyle('bgColor', e.target.value)}
                        className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono">{builderConfig.global.bgColor || '#0b0b0f'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WEDDING DETAILS CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  label="Partner 1 (Groom / Bride)"
                  value={form.partner1_name}
                  onChange={e => setForm(prev => ({ ...prev, partner1_name: e.target.value }))}
                />
                <Input
                  label="Partner 2 (Bride / Groom)"
                  value={form.partner2_name}
                  onChange={e => setForm(prev => ({ ...prev, partner2_name: e.target.value }))}
                />
                <Input
                  label="Wedding Date"
                  type="date"
                  value={form.wedding_date}
                  onChange={e => setForm(prev => ({ ...prev, wedding_date: e.target.value }))}
                />
                <Input
                  label="Ceremony Time"
                  value={form.wedding_time}
                  onChange={e => setForm(prev => ({ ...prev, wedding_time: e.target.value }))}
                />
                <Input
                  label="Reception Time"
                  placeholder="e.g. 7:00 PM (Leave empty if none)"
                  value={form.reception_time}
                  onChange={e => setForm(prev => ({ ...prev, reception_time: e.target.value }))}
                />
                <Input
                  label="Venue Name"
                  placeholder="Shangri-La Hotel Colombo"
                  value={form.venue_name}
                  onChange={e => setForm(prev => ({ ...prev, venue_name: e.target.value }))}
                />
                <Input
                  label="Venue Address"
                  placeholder="Colombo 03, Sri Lanka"
                  value={form.venue_address}
                  onChange={e => setForm(prev => ({ ...prev, venue_address: e.target.value }))}
                />
                <Input
                  label="RSVP Deadline"
                  type="date"
                  value={form.rsvp_deadline}
                  onChange={e => setForm(prev => ({ ...prev, rsvp_deadline: e.target.value }))}
                />
                <Input
                  label="Couple Phone (For SMS)"
                  placeholder="07X XXX XXXX"
                  value={form.couple_phone}
                  onChange={e => setForm(prev => ({ ...prev, couple_phone: e.target.value }))}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">👦 Groom Details</h3>
              <div className="space-y-3">
                <Input
                  label="Groom Full Name"
                  value={form.groom_full_name}
                  onChange={e => setForm(prev => ({ ...prev, groom_full_name: e.target.value }))}
                />
                <Input
                  label="Groom Parents Name"
                  value={form.groom_parents}
                  onChange={e => setForm(prev => ({ ...prev, groom_parents: e.target.value }))}
                />
                <Textarea
                  label="Groom Bio/Note"
                  rows={2}
                  value={form.groom_bio}
                  onChange={e => setForm(prev => ({ ...prev, groom_bio: e.target.value }))}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">👧 Bride Details</h3>
              <div className="space-y-3">
                <Input
                  label="Bride Full Name"
                  value={form.bride_full_name}
                  onChange={e => setForm(prev => ({ ...prev, bride_full_name: e.target.value }))}
                />
                <Input
                  label="Bride Parents Name"
                  value={form.bride_parents}
                  onChange={e => setForm(prev => ({ ...prev, bride_parents: e.target.value }))}
                />
                <Textarea
                  label="Bride Bio/Note"
                  rows={2}
                  value={form.bride_bio}
                  onChange={e => setForm(prev => ({ ...prev, bride_bio: e.target.value }))}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">🗺️ Google Maps Embed Link</h3>
              <div className="space-y-3">
                <Textarea
                  label="Google Maps Embed Link / iframe"
                  placeholder="Paste embed code or URL"
                  rows={2}
                  value={form.google_maps_embed_url}
                  onChange={e => setForm(prev => ({ ...prev, google_maps_embed_url: e.target.value }))}
                />
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">📞 Contact Organizers</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Bride Contact Number"
                    placeholder="e.g. 0711111111"
                    value={form.bride_contact}
                    onChange={e => setForm(prev => ({ ...prev, bride_contact: e.target.value }))}
                  />
                  <Input
                    label="Groom Contact Number"
                    placeholder="e.g. 0711111111"
                    value={form.groom_contact}
                    onChange={e => setForm(prev => ({ ...prev, groom_contact: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Family Contact Number"
                    placeholder="e.g. 0711111111"
                    value={form.family_contact}
                    onChange={e => setForm(prev => ({ ...prev, family_contact: e.target.value }))}
                  />
                  <Input
                    label="WhatsApp RSVP Number"
                    placeholder="e.g. 94711111111"
                    value={form.whatsapp_number}
                    onChange={e => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DYNAMIC PHOTO UPLOADS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300">👦 Groom Photo</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="groom-photo-upload"
                  accept="image/*"
                  onChange={e => handleUploadBg(e, 'groom_photo')}
                  className="hidden"
                />
                {form.groom_photo_url ? (
                  <div className="space-y-3">
                    <div className="relative h-28 w-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                      <img 
                        src={form.groom_photo_url} 
                        alt="Groom" 
                        className="object-cover w-full h-full" 
                        style={{
                          objectPosition: `${builderConfig.global.groomPhotoX ?? 50}% ${builderConfig.global.groomPhotoY ?? 50}%`,
                          transform: `scale(${builderConfig.global.groomPhotoScale ?? 1})`,
                          transformOrigin: `${builderConfig.global.groomPhotoX ?? 50}% ${builderConfig.global.groomPhotoY ?? 50}%`
                        }}
                      />
                      <button
                        onClick={() => handleDeleteFile('groom_photo')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer text-red-400"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-[#d4af37]">Align & Zoom Photo</div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Vertical Position (Y)</span>
                          <span>{builderConfig.global.groomPhotoY ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={builderConfig.global.groomPhotoY ?? 50}
                          onChange={e => handleUpdateGlobalStyle('groomPhotoY', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Horizontal Position (X)</span>
                          <span>{builderConfig.global.groomPhotoX ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={builderConfig.global.groomPhotoX ?? 50}
                          onChange={e => handleUpdateGlobalStyle('groomPhotoX', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Zoom Scale</span>
                          <span>{builderConfig.global.groomPhotoScale ?? 1.0}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.05"
                          value={builderConfig.global.groomPhotoScale ?? 1.0}
                          onChange={e => handleUpdateGlobalStyle('groomPhotoScale', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full text-xs py-2"
                    onClick={() => document.getElementById('groom-photo-upload')?.click()}
                    loading={!!uploading.groom_photo}
                  >
                    Upload Groom Photo
                  </Button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">👧 Bride Photo</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="bride-photo-upload"
                  accept="image/*"
                  onChange={e => handleUploadBg(e, 'bride_photo')}
                  className="hidden"
                />
                {form.bride_photo_url ? (
                  <div className="space-y-3">
                    <div className="relative h-28 w-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                      <img 
                        src={form.bride_photo_url} 
                        alt="Bride" 
                        className="object-cover w-full h-full" 
                        style={{
                          objectPosition: `${builderConfig.global.bridePhotoX ?? 50}% ${builderConfig.global.bridePhotoY ?? 50}%`,
                          transform: `scale(${builderConfig.global.bridePhotoScale ?? 1})`,
                          transformOrigin: `${builderConfig.global.bridePhotoX ?? 50}% ${builderConfig.global.bridePhotoY ?? 50}%`
                        }}
                      />
                      <button
                        onClick={() => handleDeleteFile('bride_photo')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer text-red-400"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-[#d4af37]">Align & Zoom Photo</div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Vertical Position (Y)</span>
                          <span>{builderConfig.global.bridePhotoY ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={builderConfig.global.bridePhotoY ?? 50}
                          onChange={e => handleUpdateGlobalStyle('bridePhotoY', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Horizontal Position (X)</span>
                          <span>{builderConfig.global.bridePhotoX ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={builderConfig.global.bridePhotoX ?? 50}
                          onChange={e => handleUpdateGlobalStyle('bridePhotoX', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Zoom Scale</span>
                          <span>{builderConfig.global.bridePhotoScale ?? 1.0}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.05"
                          value={builderConfig.global.bridePhotoScale ?? 1.0}
                          onChange={e => handleUpdateGlobalStyle('bridePhotoScale', e.target.value)}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full text-xs py-2"
                    onClick={() => document.getElementById('bride-photo-upload')?.click()}
                    loading={!!uploading.bride_photo}
                  >
                    Upload Bride Photo
                  </Button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">👩‍❤️‍👨 Couple Cover Photo</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="couple-photo-upload"
                  accept="image/*"
                  onChange={e => handleUploadBg(e, 'photo')}
                  className="hidden"
                />
                {form.photo_url ? (
                  <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photo_url} alt="Couple Cover" className="object-cover w-full h-full" />
                    <button
                      onClick={() => handleDeleteFile('photo')}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full text-xs py-2"
                    onClick={() => document.getElementById('couple-photo-upload')?.click()}
                    loading={!!uploading.photo}
                  >
                    Upload Couple Cover Photo
                  </Button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">📸 Gallery Photos</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  id="gallery-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={e => handleUploadBg(e, 'gallery')}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  className="w-full text-xs py-2"
                  onClick={() => document.getElementById('gallery-photo-upload')?.click()}
                  loading={!!uploading.gallery}
                >
                  📸 Upload Gallery Photos (Max 8)
                </Button>
                
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {form.gallery_urls?.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-slate-900 border border-slate-800 group">
                      <img src={url} alt={`Gallery ${idx}`} className="object-cover w-full h-full" />
                      <button
                        onClick={() => handleDeleteFile('gallery', idx)}
                        className="absolute inset-0 bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE & TRANSITIONS */}
          {activeTab === 'animations' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300">Wedding Timeline/Story</h3>
              <p className="text-xs text-slate-400">Add milestones or schedules to show on the details scroll section.</p>

              <div className="space-y-3 bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl">
                <h4 className="text-xs font-semibold text-[#d4af37]">Custom Titles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Section Title"
                    placeholder="e.g. Love Story, Our Timeline"
                    value={builderConfig.global.timelineTitle ?? 'Love Story'}
                    onChange={e => handleUpdateGlobalStyle('timelineTitle', e.target.value)}
                  />
                  <Input
                    label="Section Subtitle"
                    placeholder="e.g. Our Journey, Event Schedule"
                    value={builderConfig.global.timelineSubtitle ?? 'Our Journey'}
                    onChange={e => handleUpdateGlobalStyle('timelineSubtitle', e.target.value)}
                  />
                </div>
              </div>
              
              <h4 className="text-xs font-semibold text-slate-300 pt-2">Add Timeline Milestone</h4>
              
              <form onSubmit={handleAddTimelineEvent} className="space-y-2.5 bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
                <Input
                  label="Title"
                  placeholder="Poruwa Ceremony"
                  value={newEvent.title}
                  onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  label="Date/Time"
                  placeholder="10:30 AM"
                  value={newEvent.date}
                  onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
                <Textarea
                  label="Description"
                  placeholder="Optional details"
                  rows={2}
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button variant="primary" type="submit" className="w-full text-xs py-1.5 rounded-lg">
                  ➕ Add Event
                </Button>
              </form>

              <div className="space-y-2 pt-2">
                {form.timeline_events?.map((ev, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <div className="text-xs">
                      <span className="font-bold text-rose-400 mr-2">{ev.date}</span>
                      <span className="text-slate-300 font-serif font-bold">{ev.title}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTimelineEvent(idx)}
                      className="text-xs hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GUEST LINKS & RSVP LIST */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300">Invite Guests</h3>
              <p className="text-xs text-slate-400">Generate personalized links and tracking invites for your guests.</p>
              
              <form onSubmit={handleAddGuest} className="space-y-2 bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
                <Input
                  label="Guest Name"
                  placeholder="Amara Perera"
                  value={newGuest.name}
                  onChange={e => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Phone (optional)"
                  placeholder="07XXXXXXXX"
                  value={newGuest.phone}
                  onChange={e => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Button variant="primary" type="submit" className="w-full text-xs py-1.5 rounded-lg">
                  Generate Link
                </Button>
              </form>

              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <Input
                  placeholder="Search guests..."
                  value={guestSearch}
                  onChange={e => setGuestSearch(e.target.value)}
                />

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {guestLoading ? (
                    <div className="text-xs text-slate-400 py-2">Loading guests...</div>
                  ) : filteredGuests.length > 0 ? (
                    filteredGuests.map((g) => (
                      <div key={g.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/80 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{g.name}</span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                            g.status === 'opened' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            onClick={() => handleCopyLink(g)}
                            className="bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            🔗 Link
                          </button>
                          <button
                            onClick={() => copyGuestMessage(g)}
                            className="bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            💬 Message
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="text-red-400 hover:bg-red-500/10 px-2 py-1 rounded text-[10px] ml-auto cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-2">No guests found.</div>
                  )}
                </div>
              </div>

              {/* PAYMENT ACTIVATION */}
              <h3 className="text-xs font-bold text-slate-300 border-t border-slate-800/80 pt-3">Activate Package</h3>
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-2">
                <Select
                  label="Select Tier"
                  value={selectedPackage}
                  onChange={e => setSelectedPackage(e.target.value as any)}
                  options={[
                    { value: 'basic', label: 'Basic Plan (Free Test)' },
                    { value: 'premium', label: 'Premium Plan' },
                    { value: 'luxury', label: 'Luxury Plan' },
                  ]}
                />
                
                <div className="flex gap-2 pt-1.5">
                  <Button variant="primary" className="flex-1 text-xs py-1.5 rounded-lg" onClick={handlePayHere}>
                    Activate Pro
                  </Button>
                  <Button variant="secondary" className="flex-1 text-xs py-1.5 rounded-lg" onClick={handleFreeActivate} loading={freeLoading}>
                    Free Test
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER VIEWPORT CANVAS ── */}
      <div className="flex-1 flex flex-col bg-[#08090c] overflow-hidden select-none relative h-full">
        {/* Top canvas controls */}
        <div className="h-14 bg-[#0c0f13] border-b border-slate-800/80 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="font-serif text-sm text-slate-300 font-bold tracking-widest hidden md:block">InviteCraft Template Builder</div>
          
          {/* Viewport controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#12161e] border border-slate-800 rounded-lg p-0.5">
              {[
                { id: 'desktop', icon: '💻' },
                { id: 'tablet', icon: '📱' },
                { id: 'mobile', icon: '📞' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewport(v.id as Viewport)}
                  className={`p-1.5 rounded-md text-sm transition-all cursor-pointer ${
                    viewport === v.id ? 'bg-rose-500/10 text-rose-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {v.icon}
                </button>
              ))}
            </div>

            {/* Preview mode toggle */}
            <div className="flex bg-[#12161e] border border-slate-800 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setPreviewMode('section')}
                className={`px-2.5 py-1 rounded-md text-[9px] uppercase font-bold transition-all cursor-pointer ${
                  previewMode === 'section' ? 'bg-rose-500/10 text-rose-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => setPreviewMode('full')}
                className={`px-2.5 py-1 rounded-md text-[9px] uppercase font-bold transition-all cursor-pointer ${
                  previewMode === 'full' ? 'bg-rose-500/10 text-rose-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Full Scroll
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 scale-90">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Preview · Live
            </span>
            <Button
              variant="secondary"
              className="text-xs py-1 px-3 border-slate-800 bg-[#12161e] rounded-lg cursor-pointer"
              onClick={() => handleSave(false)}
              loading={saveLoading}
            >
              💾 Save
            </Button>
            <Button
              variant="primary"
              className="text-xs py-1 px-3 rounded-lg cursor-pointer"
              onClick={() => handleSave(true)}
              loading={saveLoading}
            >
              🚀 Publish
            </Button>
          </div>
        </div>

        {/* Viewport container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto h-full">
          <div
            className={`border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-300 flex flex-col h-full ${
              viewport === 'desktop' ? 'w-full max-w-[800px]' : viewport === 'tablet' ? 'w-[600px]' : 'w-[360px]'
            }`}
            style={{
              backgroundColor: builderConfig.global.bgColor || '#0b0b0f',
              backgroundImage: builderConfig.global.bgType === 'image' && builderConfig.global.bgUrl ? `url(${builderConfig.global.bgUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Live customizer style definitions inserted locally in preview */}
            <style jsx global>{`
              .preview-font-primary {
                font-family: '${builderConfig.global.primaryFont}', serif !important;
              }
              .preview-font-secondary {
                font-family: '${builderConfig.global.secondaryFont}', sans-serif !important;
              }
              .preview-font-section {
                font-family: '${activeSectionStyle.fontFamily || builderConfig.global.primaryFont}', serif !important;
              }
              /* Custom scrollbars for viewport preview */
              .preview-scroll-container::-webkit-scrollbar {
                width: 6px !important;
                height: 6px !important;
                display: block !important;
              }
              .preview-scroll-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.03) !important;
                border-radius: 3px !important;
              }
              .preview-scroll-container::-webkit-scrollbar-thumb {
                background: rgba(244, 63, 94, 0.35) !important; /* rose-500 */
                border-radius: 3px !important;
              }
              .preview-scroll-container::-webkit-scrollbar-thumb:hover {
                background: rgba(244, 63, 94, 0.6) !important;
              }
            `}</style>

            {previewMode === 'full' ? (
              <div className="w-full h-full overflow-y-auto divide-y divide-slate-900/50 preview-scroll-container">
                {builderConfig.sections.map(sec => renderSectionPreview(sec.id, true))}
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto preview-scroll-container">
                {renderSectionPreview(activeSectionId, false)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (SECTION PROPERTY SETTINGS) ── */}
      <div className="w-full md:w-[320px] bg-[#0c0f13] border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col z-10 shrink-0 select-none overflow-y-auto max-h-[45vh] md:max-h-full">
        <div className="p-4 border-b border-slate-800/80">
          <label className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Editing Settings For:</label>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-serif">{activeSection.title}</span>
            <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">{activeSection.type.toUpperCase()}</span>
          </div>
        </div>

        {/* Section specific tabs */}
        <div className="grid grid-cols-3 bg-[#090b0e] p-1 border-b border-slate-800/80">
          {[
            { id: 'content', label: 'Content' },
            { id: 'style', label: 'Style' },
            { id: 'animation', label: 'Motion' }
          ].map(rt => (
            <button
              key={rt.id}
              onClick={() => setActiveRightTab(rt.id as RightTab)}
              className={`text-center py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                activeRightTab === rt.id
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-900/30 border border-red-700/40 rounded-lg text-[11px] text-red-400 font-mono leading-tight whitespace-normal">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="px-3 py-2 bg-green-900/30 border border-green-700/40 rounded-lg text-[11px] text-green-400 font-mono">
              ✓ {success}
            </div>
          )}

          {/* RIGHT TAB 1: SECTION CONTENT */}
          {activeRightTab === 'content' && (
            <div className="space-y-4">
              {activeSection.type === 'open' && (
                <div className="space-y-3">
                  <Input
                    label="Welcome Header"
                    value={activeSection.content.title || ''}
                    onChange={e => handleUpdateSectionContent('title', e.target.value)}
                  />
                  <Input
                    label="Welcome Subtitle"
                    value={activeSection.content.subtitle || ''}
                    onChange={e => handleUpdateSectionContent('subtitle', e.target.value)}
                  />
                  <Input
                    label="Opening Button Label"
                    value={activeSection.content.buttonText || ''}
                    onChange={e => handleUpdateSectionContent('buttonText', e.target.value)}
                  />
                  <Select
                    label="Names & Text Overlay"
                    value={activeSection.content.hideOverlay ? 'true' : 'false'}
                    onChange={e => handleUpdateSectionContent('hideOverlay', e.target.value === 'true')}
                    options={[
                      { value: 'false', label: 'Show Name & Text Overlay' },
                      { value: 'true', label: 'Hide Name & Text Overlay' }
                    ]}
                  />
                </div>
              )}

              {activeSection.type === 'intro' && (
                <div className="space-y-3">
                  <Input
                    label="Title Header"
                    value={activeSection.content.title || ''}
                    onChange={e => handleUpdateSectionContent('title', e.target.value)}
                  />
                  <Input
                    label="Subtitle Description"
                    value={activeSection.content.subtitle || ''}
                    onChange={e => handleUpdateSectionContent('subtitle', e.target.value)}
                  />
                  <Select
                    label="Names & Text Overlay"
                    value={activeSection.content.hideOverlay ? 'true' : 'false'}
                    onChange={e => handleUpdateSectionContent('hideOverlay', e.target.value === 'true')}
                    options={[
                      { value: 'false', label: 'Show Name & Text Overlay' },
                      { value: 'true', label: 'Hide Name & Text Overlay' }
                    ]}
                  />
                  <Select
                    label="Loop Video at Details Top"
                    value={activeSection.content.loopAtTop ? 'true' : 'false'}
                    onChange={e => handleUpdateSectionContent('loopAtTop', e.target.value === 'true')}
                    options={[
                      { value: 'false', label: 'Play Once on Intro' },
                      { value: 'true', label: 'Loop as Details Top Background' }
                    ]}
                  />
                </div>
              )}

              {activeSection.type === 'details' && (
                <div className="space-y-3">
                  <Input
                    label="Header Title"
                    value={activeSection.content.title || ''}
                    onChange={e => handleUpdateSectionContent('title', e.target.value)}
                  />
                  <Input
                    label="Welcome Label"
                    value={activeSection.content.subtitle || ''}
                    onChange={e => handleUpdateSectionContent('subtitle', e.target.value)}
                  />
                  <Textarea
                    label="Event Custom Note"
                    rows={2}
                    value={form.custom_message}
                    onChange={e => setForm(prev => ({ ...prev, custom_message: e.target.value }))}
                  />
                </div>
              )}

              {!['open', 'intro', 'details'].includes(activeSection.type) && (
                <div className="space-y-3">
                  <Input
                    label="Section Title"
                    value={activeSection.content.title || ''}
                    onChange={e => handleUpdateSectionContent('title', e.target.value)}
                  />
                  <Input
                    label="Section Subtitle"
                    value={activeSection.content.subtitle || ''}
                    onChange={e => handleUpdateSectionContent('subtitle', e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* RIGHT TAB 2: SECTION STYLE CUSTOMIZER */}
          {activeRightTab === 'style' && (
            <div className="space-y-4">
              {/* Background Types */}
              {['open', 'intro'].includes(activeSection.type) && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Background Media Type</label>
                  <div className="grid grid-cols-3 bg-[#12161e] border border-slate-800 rounded-lg p-0.5">
                    {[
                      { id: 'video', label: '🎬 Video' },
                      { id: 'image', label: '🖼️ Image' },
                      { id: 'color', label: '🎨 Color' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleUpdateSectionStyle('bgType', t.id)}
                        className={`text-center py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                          activeSectionStyle.bgType === t.id
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background File Upload */}
              {['open', 'intro'].includes(activeSection.type) && activeSectionStyle.bgType !== 'color' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {activeSectionStyle.bgType === 'video' ? 'Upload Video (Max 50MB)' : 'Upload Background Image (Max 10MB)'}
                  </label>
                  <input
                    type="file"
                    id="bg-file-upload"
                    accept={activeSectionStyle.bgType === 'video' ? 'video/*' : 'image/*'}
                    onChange={e => handleUploadBg(e, 'bg_url')}
                    className="hidden"
                  />
                  
                  {activeSectionStyle.bgUrl ? (
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate text-rose-300 font-mono w-[80%]">{activeSectionStyle.bgUrl.split('/').pop()}</div>
                      <button
                        onClick={() => handleUpdateSectionStyle('bgUrl', '')}
                        className="text-xs hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full text-xs py-2"
                      onClick={() => document.getElementById('bg-file-upload')?.click()}
                      loading={!!uploading[activeSection.type === 'open' ? 'cover' : 'video']}
                    >
                      ☁️ Upload File
                    </Button>
                  )}

                  <div className="pt-2">
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">Or Paste Direct URL</label>
                    <Input
                      placeholder="https://..."
                      value={activeSectionStyle.bgUrl || ''}
                      onChange={e => handleUpdateSectionStyle('bgUrl', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Color pickers */}
              {(activeSectionStyle.bgType === 'color' || !['open', 'intro'].includes(activeSection.type)) && (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Background Color</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={activeSectionStyle.bgColor || '#0b0b0f'}
                      onChange={e => handleUpdateSectionStyle('bgColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{activeSectionStyle.bgColor || '#0b0b0f'}</span>
                  </div>
                </div>
              )}

              {/* Overlay styling for Open and Intro Animations */}
              {['open', 'intro'].includes(activeSection.type) && (
                <div className="space-y-3 border-t border-slate-850 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overlay Opacity</label>
                    <span className="text-[10px] font-mono font-bold text-rose-400">{activeSectionStyle.bgOverlayOpacity ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeSectionStyle.bgOverlayOpacity ?? 50}
                    onChange={e => handleUpdateSectionStyle('bgOverlayOpacity', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Overlay Color</label>
                    <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                      <input
                        type="color"
                        value={activeSectionStyle.bgOverlayColor || '#000000'}
                        onChange={e => handleUpdateSectionStyle('bgOverlayColor', e.target.value)}
                        className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                      />
                      <span className="text-xs font-mono">{activeSectionStyle.bgOverlayColor || '#000000'}</span>
                    </div>
                  </div>

                  {['open', 'intro'].includes(activeSection.type) && (
                    <div className="border-t border-slate-800/60 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Text Vertical Position</label>
                        <span className="text-[10px] font-mono font-bold text-rose-400">
                          {activeSectionStyle.overlayY ?? (activeSection.type === 'open' ? 45 : 75)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={activeSectionStyle.overlayY ?? (activeSection.type === 'open' ? 45 : 75)}
                        onChange={e => handleUpdateSectionStyle('overlayY', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Fonts overrides */}
              <div className="border-t border-slate-850 pt-3 space-y-3">
                <Select
                  label="Section Font Overrides"
                  value={activeSectionStyle.fontFamily || ''}
                  onChange={e => handleUpdateSectionStyle('fontFamily', e.target.value)}
                  options={[
                    { value: '', label: 'Inherit Global Font' },
                    ...GOOGLE_FONTS.map(f => ({ value: f, label: f }))
                  ]}
                />

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Title Color Override</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={activeSectionStyle.titleColor || activeSectionStyle.textColor || '#ffffff'}
                      onChange={e => handleUpdateSectionStyle('titleColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{activeSectionStyle.titleColor || activeSectionStyle.textColor || '#ffffff'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Subtitle Color Override</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={activeSectionStyle.subtitleColor || activeSectionStyle.textColor || '#ffffff'}
                      onChange={e => handleUpdateSectionStyle('subtitleColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{activeSectionStyle.subtitleColor || activeSectionStyle.textColor || '#ffffff'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Body Text Color Override</label>
                  <div className="flex items-center gap-2 bg-[#12161e] border border-slate-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={activeSectionStyle.textColor || '#ffffff'}
                      onChange={e => handleUpdateSectionStyle('textColor', e.target.value)}
                      className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{activeSectionStyle.textColor || '#ffffff'}</span>
                  </div>
                </div>
              </div>

              {/* Spacings */}
              <div className="border-t border-slate-850 pt-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Padding Top</label>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">{activeSectionStyle.paddingTop ?? 80}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeSectionStyle.paddingTop ?? 80}
                    onChange={e => handleUpdateSectionStyle('paddingTop', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Padding Bottom</label>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">{activeSectionStyle.paddingBottom ?? 80}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={activeSectionStyle.paddingBottom ?? 80}
                    onChange={e => handleUpdateSectionStyle('paddingBottom', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Advanced box border shadow styles */}
              <div className="border-t border-slate-850 pt-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Border Radius</label>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">{activeSectionStyle.borderRadius ?? 8}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={activeSectionStyle.borderRadius ?? 8}
                    onChange={e => handleUpdateSectionStyle('borderRadius', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Box Shadow</label>
                  <button
                    onClick={() => handleUpdateSectionStyle('boxShadow', !activeSectionStyle.boxShadow)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold uppercase ${
                      activeSectionStyle.boxShadow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-850 text-slate-500'
                    }`}
                  >
                    {activeSectionStyle.boxShadow ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT TAB 3: ANIMATIONS */}
          {activeRightTab === 'animation' && (
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Entrance Transition Effect</label>
              <Select
                value={activeSection.styles.borderRadius ? 'fade' : 'none'}
                onChange={() => {}}
                options={[
                  { value: 'fade', label: 'GSAP Fade In Reveal' },
                  { value: 'slide', label: 'GSAP Slide Up' },
                  { value: 'zoom', label: 'GSAP Scale/Zoom' },
                  { value: 'none', label: 'No transition' }
                ]}
              />

              <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  💡 GSAP is automatically enabled for fluid page entry points. Scroll reveals will animate elements dynamically when loading is completed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
