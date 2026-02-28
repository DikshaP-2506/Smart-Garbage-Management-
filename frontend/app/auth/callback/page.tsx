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

    // Small delay to ensure searchParams are ready
    setTimeout(handleAuthCallback, 100);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-900 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h1>
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing your Google login...</span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          This window will close automatically when complete.
        </p>
      </div>
    </div>
  );
}