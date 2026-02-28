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
    }
  }
}

export type UserRole = 'CITIZEN' | 'WORKER' | 'ADMIN'
export type AuthProvider = 'EMAIL' | 'GOOGLE'