-- FloodGuard AI Authentication Integration with Existing Schema
-- Run this SQL in your Supabase SQL Editor
-- This creates the profiles table and trigger system as per the exact flow requirements

-- Create profiles table (this replaces auth_users table)
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'WORKER', 'ADMIN')),
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'EMAIL' CHECK (auth_provider IN ('EMAIL', 'GOOGLE')),
  phone VARCHAR(20),
  avatar_url TEXT,
  ward_id BIGINT REFERENCES wards(id), -- Link to existing wards table
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  emergency_contact VARCHAR(20),
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  location_coordinates POINT, -- For citizen location tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link workers to profiles table (modify existing worker_attendance if needed)
-- Add profile_id to link workers with authentication
ALTER TABLE worker_attendance 
ADD COLUMN IF NOT EXISTS profile_id BIGINT REFERENCES profiles(id);

-- Add profile_id to job_assignments to track which authenticated user created/assigned jobs
ALTER TABLE job_assignments 
ADD COLUMN IF NOT EXISTS assigned_by_profile_id BIGINT REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS assigned_to_profile_id BIGINT REFERENCES profiles(id);

-- Add profile_id to tickets to track who submitted the ticket
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS submitted_by_profile_id BIGINT REFERENCES profiles(id);

-- Create user_sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  refresh_token TEXT,
  device_info JSONB,
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ward_id ON profiles(ward_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_tickets_submitted_by ON tickets(submitted_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_assigned_to ON job_assignments(assigned_to_profile_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_id);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.auth_id = auth.uid() 
      AND p.role = 'ADMIN'
    )
  );

-- Admins can update user roles
CREATE POLICY "Admins can update user roles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.auth_id = auth.uid() 
      AND p.role = 'ADMIN'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view own user profile" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_profiles.user_id 
      AND p.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own user profile" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_profiles.user_id 
      AND p.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own user profile" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_profiles.user_id 
      AND p.auth_id = auth.uid()
    )
  );

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_sessions.user_id 
      AND p.auth_id = auth.uid()
    )
  );

-- Create function to handle user creation on auth signup
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_id, email, full_name, role, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CITIZEN'),
    CASE 
      WHEN NEW.app_metadata->>'provider' = 'google' THEN 'GOOGLE'
      ELSE 'EMAIL'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for complete user information
CREATE OR REPLACE VIEW user_complete_info AS
SELECT 
  p.id,
  p.auth_id,
  p.email,
  p.full_name,
  p.role,
  p.auth_provider,
  p.phone,
  p.avatar_url,
  p.ward_id,
  w.ward_name,
  p.is_active,
  p.created_at,
  p.updated_at,
  up.address,
  up.emergency_contact,
  up.notification_preferences,
  up.location_coordinates
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.user_id
LEFT JOIN wards w ON p.ward_id = w.id;