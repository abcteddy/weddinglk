// Auto-generate the real version with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      couples: {
        Row: {
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
          package: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          partner1_name: string
          partner2_name: string
          wedding_date: string
          wedding_time: string
          venue_name: string
          venue_address?: string | null
          rsvp_deadline?: string | null
          template_id?: string
          custom_message?: string | null
          photo_url?: string | null
          cover_url?: string | null
          music_url?: string | null
          video_url?: string | null
          gallery_urls?: string[] | null
          couple_phone?: string | null
          is_published?: boolean
          is_paid?: boolean
          package?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          partner1_name?: string
          partner2_name?: string
          wedding_date?: string
          wedding_time?: string
          venue_name?: string
          venue_address?: string | null
          rsvp_deadline?: string | null
          template_id?: string
          custom_message?: string | null
          photo_url?: string | null
          cover_url?: string | null
          music_url?: string | null
          video_url?: string | null
          gallery_urls?: string[] | null
          couple_phone?: string | null
          is_published?: boolean
          is_paid?: boolean
          package?: string
          created_at?: string
          updated_at?: string
        }
      }
      rsvps: {
        Row: {
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
        Insert: {
          id?: string
          invitation_id: string
          guest_name: string
          guest_phone?: string | null
          attending: boolean
          guest_count?: number
          meal_preference?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invitation_id?: string
          guest_name?: string
          guest_phone?: string | null
          attending?: boolean
          guest_count?: number
          meal_preference?: string | null
          message?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invitation_id: string
          payhere_order_id: string | null
          amount: number
          currency: string
          status: string
          package: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invitation_id: string
          payhere_order_id?: string | null
          amount: number
          currency?: string
          status?: string
          package?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invitation_id?: string
          payhere_order_id?: string | null
          amount?: number
          currency?: string
          status?: string
          package?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
