export interface RSVPFormData {
  name: string
  phone: string
  attending: 'yes' | 'no'
  guestCount: string
  meal: 'veg' | 'non-veg' | 'vegan' | 'halal' | ''
  message: string
}

export interface RSVP {
  id: string
  invitation_id: string
  guest_name: string
  guest_phone: string | null
  attending: boolean
  guest_count: number
  meal_preference: string | null
  message: string | null
  created_at: string
}

export interface RSVPStats {
  total: number
  attending: number
  declined: number
  totalGuests: number
}
