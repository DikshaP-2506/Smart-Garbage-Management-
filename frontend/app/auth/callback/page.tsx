'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { authAPI } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle auth callback from Supabase
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        if (data.session) {
          // Get user profile
          const profile = await authAPI.getUserProfile(data.session.user.id)
          if (profile) {
            // Redirect based on user role
            const redirectPath = authAPI.getRoleBasedRoute(profile.role)
            router.replace(redirectPath)
          } else {
            // Redirect to onboarding if profile not found
            router.replace('/onboarding')
          }
        } else {
          // No session, redirect to login
          router.replace('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.replace('/login?error=callback_failed')
      }
    }
    // Small delay to ensure searchParams or router are ready
    setTimeout(handleAuthCallback, 100)
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
        <p className="text-gray-600 mt-4">Processing authentication...</p>
      </div>
    </div>
  )
}