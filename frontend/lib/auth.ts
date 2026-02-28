import { supabase, type UserRole } from './supabase'
import { AuthError, User } from '@supabase/supabase-js'

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  fullName: string
  role?: UserRole
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export interface AuthResponse {
  user: UserProfile | null
  error?: string
}

class AuthAPI {
  // 🟢 1️⃣ SIGN UP (Email + Password)
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role || 'CITIZEN'
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          fullName: data.fullName,
          role: (data.role || 'CITIZEN') as UserRole
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Signup failed'
      }
    }
  }

  // 🟢 2️⃣ LOGIN (Email + Password)
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (signInError) {
        throw signInError
      }

      if (!authData.user) {
        throw new Error('Failed to authenticate')
      }

      // Fetch user profile from auth_users table
      const profile = await this.getUserProfile(authData.user.id)
      if (!profile) {
        throw new Error('User profile not found')
      }

      return {
        user: profile
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  // 🟢 3️⃣ CONTINUE WITH GOOGLE
  async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  // Get current user session
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        return null
      }

      const profile = await this.getUserProfile(session.user.id)
      return profile
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Get user profile from profiles table
  async getUserProfile(authId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, auth_id, email, full_name, role')
        .eq('auth_id', authId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }

      return {
        id: data.auth_id,
        email: data.email,
        fullName: data.full_name,
        role: data.role as UserRole
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session?.user
    } catch {
      return false
    }
  }

  // 🧭 4️⃣ ROLE-BASED REDIRECTION
  getRoleBasedRoute(role: UserRole): string {
    switch (role) {
      case 'CITIZEN':
        return '/citizen/dashboard'
      case 'WORKER':
        return '/worker/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/onboarding'
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        callback(profile)
      } else {
        callback(null)
      }
    })
  }
}

// Export singleton instance
export const authAPI = new AuthAPI()

// Helper function for error handling
export const handleAuthError = (error: unknown): string => {
  if (error instanceof AuthError) {
    // Handle specific Supabase auth errors
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link'
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      default:
        return error.message
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}