import { createClient } from '@supabase/supabase-js'

// For client-side components, use hardcoded values or Next.js public env vars
// For server-side, use process.env directly
const getSupabaseConfig = () => {
  // Try Next.js public env vars first
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If not available, use direct env vars (server-side only)
  if (!supabaseUrl && typeof window === 'undefined') {
    supabaseUrl = process.env.SUPABASE_URL
  }
  if (!supabaseAnonKey && typeof window === 'undefined') {
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  }
  
  // Fallback to your actual values if env vars are not working
  if (!supabaseUrl) {
    supabaseUrl = 'https://kzbskltgojbawtbzsynj.supabase.co'
  }
  if (!supabaseAnonKey) {
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnNrbHRnb2piYXd0YnpzeW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDcxNTYsImV4cCI6MjA4NzgyMzE1Nn0.aHBYnuxJSW7H9diaYX9B8mGM98pdAk3lAGSXTnoVUuY'
  }
  
  return { supabaseUrl, supabaseAnonKey }
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number
          auth_id: string
          email: string
          full_name: string
          role: 'CITIZEN' | 'WORKER' | 'ADMIN'
          auth_provider: 'EMAIL' | 'GOOGLE'
          phone: string | null
          avatar_url: string | null
          ward_id: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          auth_id: string
          email: string
          full_name: string
          role?: 'CITIZEN' | 'WORKER' | 'ADMIN'
          auth_provider?: 'EMAIL' | 'GOOGLE'
          phone?: string | null
          avatar_url?: string | null
          ward_id?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          auth_id?: string
          email?: string
          full_name?: string
          role?: 'CITIZEN' | 'WORKER' | 'ADMIN'
          auth_provider?: 'EMAIL' | 'GOOGLE'
          phone?: string | null
          avatar_url?: string | null
          ward_id?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: number
          user_id: number
          address: string | null
          emergency_contact: string | null
          notification_preferences: any
          location_coordinates: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          address?: string | null
          emergency_contact?: string | null
          notification_preferences?: any
          location_coordinates?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          address?: string | null
          emergency_contact?: string | null
          notification_preferences?: any
          location_coordinates?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          ward_id: number
          latitude: number
          longitude: number
          status: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          confidence_score: number
          title: string
          description: string
          category: string
          citizen_id: number
          image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ward_id: number
          latitude: number
          longitude: number
          status?: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          confidence_score: number
          title: string
          description: string
          category: string
          citizen_id: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ward_id?: number
          latitude?: number
          longitude?: number
          status?: 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          confidence_score?: number
          title?: string
          description?: string
          category?: string
          citizen_id?: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          assigned_by: string | null
          assigned_ward: number | null
          job_status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          assigned_by?: string | null
          assigned_ward?: number | null
          job_status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          assigned_by?: string | null
          assigned_ward?: number | null
          job_status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          title?: string | null
          created_at?: string
        }
      }
      job_tickets: {
        Row: {
          id: string
          job_id: string
          ticket_id: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          ticket_id: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          ticket_id?: string
          created_at?: string
        }
      }
      wards: {
        Row: {
          id: number
          name: string
          area_polygon: any
          population: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          area_polygon: any
          population?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          area_polygon?: any
          population?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type UserRole = 'CITIZEN' | 'WORKER' | 'ADMIN'
export type AuthProvider = 'EMAIL' | 'GOOGLE'
export type TicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'

// Type aliases for easier use
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobTicket = Database['public']['Tables']['job_tickets']['Row']
export type Ward = Database['public']['Tables']['wards']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']