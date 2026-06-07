export interface RSVPFormData {
  name: string
  phone: string
  email: string
  attending: 'yes' | 'no' | 'maybe'
  guestCount: string
  meal: 'veg' | 'non-veg' | 'vegan' | 'halal' | ''
  dietary: string
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
  
  // New fields
  guest_id: string | null
  attendance_status: 'yes' | 'no' | 'maybe'
  dietary_notes: string | null
  email: string | null
}

export interface RSVPStats {
  total: number
  attending: number
  declined: number
  maybe: number
  totalGuests: number
}

export interface Guest {
  id: string
  invitation_id: string
  name: string
  email: string | null
  phone: string | null
  token: string
  status: 'pending' | 'sent' | 'opened'
  rsvp_status: 'pending' | 'yes' | 'no' | 'maybe'
  guest_count: number
  dietary_notes: string | null
  created_at: string
  updated_at: string
}


