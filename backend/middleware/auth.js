import supabase from '../config/supabaseClient.js'

// ✅ AUTHENTICATION MIDDLEWARE
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No authorization header provided.' 
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      })
    }

    // Verify token with Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      })
    }

    // Get user profile from custom auth_users table
    const { data: userProfile, error: profileError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('auth_id', userData.user.id)
      .single()

    if (profileError) {
      return res.status(404).json({ 
        error: 'User profile not found.' 
      })
    }

    // Add user info to request object
    req.user = {
      id: userData.user.id,
      email: userData.user.email,
      fullName: userProfile.full_name,
      role: userProfile.role,
      authId: userData.user.id
    }

    next()

  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ✅ ROLE-BASED AUTHORIZATION MIDDLEWARE
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'User not authenticated. Please log in.' 
        })
      }

      const userRole = req.user.role

      // Convert allowedRoles to array if it's a string
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${rolesArray.join(' or ')}. Your role: ${userRole}` 
        })
      }

      next()

    } catch (error) {
      console.error('Authorization middleware error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// ✅ ADMIN ONLY MIDDLEWARE
export const requireAdmin = requireRole('ADMIN')

// ✅ WORKER OR ADMIN MIDDLEWARE
export const requireWorkerOrAdmin = requireRole(['WORKER', 'ADMIN'])

// ✅ ALL AUTHENTICATED USERS MIDDLEWARE
export const requireAuth = authenticateUser