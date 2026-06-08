export type TemplateId = string // Keep for database compatibility

export interface TemplateConfig {
  id: string
  name: string
  accentColor: string
  textColor: string
  fontFamily: string
  previewGradient: string
  isPremium?: boolean
  
  // Optional legacy Three.js properties to prevent compiler errors on homepage
  bgColor?: number
  ambientColor?: number
  keyLightColor?: number
  envelopeColor?: number
  flapColor?: number
  sealColor?: number
  sealEmissive?: number
  petalHue?: number
}

export type PackageType = 'basic' | 'premium' | 'luxury'

export interface TimelineEvent {
  title: string
  date: string
  description: string
  photo_url?: string
}

export interface SectionStyles {
  bgType: 'video' | 'image' | 'color'
  bgUrl?: string
  bgColor?: string
  bgOverlayOpacity?: number // 0 to 100
  bgOverlayColor?: string // hex
  fontFamily?: string
  fontWeight?: string
  textColor?: string
  titleColor?: string
  subtitleColor?: string
  paddingTop?: number // in px
  paddingBottom?: number // in px
  borderRadius?: number // in px
  boxShadow?: boolean
  overlayY?: number
}

export interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  customMessage?: string
  [key: string]: any
}

export interface SectionConfig {
  id: string
  type: 'open' | 'intro' | 'details' | 'gallery' | 'rsvp' | 'footer'
  title: string
  visible: boolean
  styles: SectionStyles
  content: SectionContent
}

export interface BuilderConfig {
  global: {
    primaryFont: string
    secondaryFont: string
    primaryColor: string
    accentColor: string
    bgMusicUrl?: string
    bgType?: 'color' | 'image'
    bgUrl?: string
    bgColor?: string
  }
  sections: SectionConfig[]
}

export interface Invitation {
  id: string
  user_id: string
  slug: string
  partner1_name: string
  partner2_name: string
  wedding_date: string
  wedding_time: string
  venue_name: string
  venue_address: string | null
  rsvp_deadline: string | null
  template_id: string
  custom_message: string | null
  photo_url: string | null
  cover_url: string | null
  music_url: string | null
  video_url: string | null
  gallery_urls: string[] | null
  couple_phone: string | null
  is_published: boolean
  is_paid: boolean
  package: PackageType
  created_at: string
  updated_at: string
  builder_config: BuilderConfig | null

  // Bride profile
  bride_photo_url: string | null
  bride_full_name: string | null
  bride_parents: string | null
  bride_bio: string | null

  // Groom profile
  groom_photo_url: string | null
  groom_full_name: string | null
  groom_parents: string | null
  groom_bio: string | null

  // Event info
  reception_time: string | null
  dress_code: string | null
  additional_instructions: string | null
  google_maps_embed_url: string | null

  // Contacts
  bride_contact: string | null
  groom_contact: string | null
  family_contact: string | null
  whatsapp_number: string | null

  // Timeline
  timeline_events: TimelineEvent[] | null

  // Registry
  registry_bank_details: string | null
  registry_qr_url: string | null
  registry_preferences: string | null
  registry_online_contributions: boolean

  // Streaming
  live_stream_platform: string | null
  live_stream_url: string | null
  live_stream_active: boolean
}

export interface InvitationWithRSVPs extends Invitation {
  rsvps: import('./rsvp').RSVP[]
}
