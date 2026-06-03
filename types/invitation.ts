export type TemplateId = 'classic' | 'modernGold' | 'tropicalGarden' | 'royalBlue'
export type PackageType = 'basic' | 'premium'

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
  couple_phone: string | null
  is_published: boolean
  is_paid: boolean
  package: PackageType
  created_at: string
  updated_at: string
}

export interface InvitationWithRSVPs extends Invitation {
  rsvps: import('./rsvp').RSVP[]
}
