export type TemplateId = 'royalWax' | 'rosePetal' | 'sinhalaTraditional' | 'royalGardenGate' | 'coupleMonogram' | 'classic' | 'modernGold' | 'tropicalGarden' | 'royalBlue'
export type PackageType = 'basic' | 'premium' | 'luxury'

export interface TimelineEvent {
  title: string
  date: string
  description: string
  photo_url?: string
}

export interface TemplateConfig {
  id: TemplateId
  name: string
  bgColor: number
  ambientColor: number
  keyLightColor: number
  envelopeColor: number
  flapColor: number
  sealColor: number
  sealEmissive: number
  petalHue: number
  fontFamily: string
  accentColor: string
  textColor: string
  previewGradient: string
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
  template_id: TemplateId
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

