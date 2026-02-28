import express from 'express'
import supabase from '../config/supabaseClient.js'

const router = express.Router()

// ✅ SIGNUP ENDPOINT
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'CITIZEN' } = req.body

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Email, password, and full name are required'
      })
    }

    // Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role.toUpperCase()
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      return res.status(400).json({
        error: authError.message
      })
    }

    // Insert user profile into custom auth_users table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('auth_users')
        .insert([{
          auth_id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role.toUpperCase(),
          created_at: new Date().toISOString()
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email for verification.',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        fullName: fullName,
        role: role.toUpperCase()
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Login error:', authError)
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    // Get user profile from custom auth_users table
    const { data: userProfile, error: profileError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // If no profile found, create default profile
      const { error: insertError } = await supabase
        .from('auth_users')
        .insert([{
          auth_id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || '',
          role: authData.user.user_metadata?.role || 'CITIZEN',
          created_at: new Date().toISOString()
        }])

      if (insertError) {
        console.error('Profile creation error:', insertError)
      }
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: userProfile?.full_name || authData.user.user_metadata?.full_name,
        role: userProfile?.role || authData.user.user_metadata?.role || 'CITIZEN'
      },
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ LOGOUT ENDPOINT
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({ message: 'Logout successful' })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ GOOGLE OAUTH ENDPOINT
router.post('/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json({
      url: data.url
    })

  } catch (error) {
    console.error('Google OAuth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ GOOGLE OAUTH CALLBACK ENDPOINT
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    // Exchange code for session with Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError || !sessionData.user) {
      console.error('Session exchange error:', sessionError)
      return res.status(400).json({ error: 'Failed to exchange code for session' })
    }

    // Get or create user profile
    let { data: userProfile, error: profileError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('auth_id', sessionData.user.id)
      .single()

    // If no profile exists, create one
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('auth_users')
        .insert([{
          auth_id: sessionData.user.id,
          email: sessionData.user.email,
          full_name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || '',
          role: 'CITIZEN', // Default role for Google signup
          avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
        return res.status(400).json({ error: 'Failed to create user profile' })
      }

      userProfile = newProfile
    } else if (profileError) {
      console.error('Profile fetch error:', profileError)
      return res.status(400).json({ error: 'Failed to fetch user profile' })
    }

    res.status(200).json({
      message: 'Google authentication successful',
      token: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        fullName: userProfile.full_name,
        role: userProfile.role,
        avatarUrl: userProfile.avatar_url
      }
    })

  } catch (error) {
    console.error('Google callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ GET USER PROFILE ENDPOINT
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]

    // Verify token with Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('auth_id', userData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return res.status(404).json({ error: 'User profile not found' })
    }

    res.status(200).json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        fullName: userProfile.full_name,
        role: userProfile.role,
        createdAt: userProfile.created_at
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ✅ UPDATE USER ROLE ENDPOINT (Admin only)
router.put('/role', async (req, res) => {
  try {
    const { userId, newRole } = req.body
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]

    // Verify admin token
    const { data: adminData, error: adminError } = await supabase.auth.getUser(token)

    if (adminError || !adminData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Check if user is admin
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('auth_users')
      .select('role')
      .eq('auth_id', adminData.user.id)
      .single()

    if (adminProfileError || adminProfile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('auth_users')
      .update({ role: newRole.toUpperCase() })
      .eq('auth_id', userId)

    if (updateError) {
      console.error('Role update error:', updateError)
      return res.status(400).json({ error: updateError.message })
    }

    res.status(200).json({ message: 'Role updated successfully' })

  } catch (error) {
    console.error('Role update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router