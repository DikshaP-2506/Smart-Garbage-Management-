# Smart Garbage Management + FloodGuard AI Authentication System

## 🎯 **Integration with Existing Schema**

This authentication system has been designed to **integrate seamlessly** with your existing Smart Garbage Management database schema. We're adding authentication tables alongside your current tables without breaking any existing functionality.

### **🔗 Schema Integration**

Your existing tables (tickets, wards, worker_attendance, job_assignments, etc.) are **preserved and enhanced**:

- **`auth_users`** - New table for authentication (doesn't conflict with existing schema)
- **`user_profiles`** - Extended user information 
- **`user_sessions`** - Session management
- **Foreign key links** added to existing tables:
  - `tickets.submitted_by_user_id` → Links tickets to authenticated users
  - `job_assignments.assigned_by_user_id` → Tracks who assigned jobs
  - `job_assignments.assigned_to_user_id` → Links assignments to workers
  - `worker_attendance.auth_user_id` → Links workers to auth system
  - `auth_users.ward_id` → Links users to existing wards

### **✅ Authentication API Endpoints** 
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/google` - Google OAuth
- `PUT /api/auth/role` - Update user role (Admin only)

#### **✅ Security Features**
- JWT token-based authentication
- Role-based access control (CITIZEN, WORKER, ADMIN)
- Protected route middleware
- Input validation
- Error handling

#### **✅ Google OAuth Integration**
- **Popup window authentication** - No page redirects
- Seamless user experience
- Automatic profile creation for new Google users
- Profile linkage with existing system

#### **✅ Database Integration**
- Supabase Auth integration
- User profiles table
- Row Level Security (RLS)
- Auto-profile creation triggers

### **Frontend (Next.js + TypeScript)**

#### **✅ Authentication Pages**
- Modern login page with validation
- Comprehensive signup with password strength
- Role-based onboarding flow
- Success/error states with animations

#### **✅ Dashboard Pages**
- Citizen Dashboard - Report floods, view alerts
- Worker Dashboard - Manage tasks, field operations  
- Admin Dashboard - User management, analytics

#### **✅ API Integration**
- TypeScript API client
- Token management
- Role-based routing
- Error handling

## 🚀 **Setup Instructions**

### **1. Database Setup - IMPORTANT**
```sql
# This SQL script adds NEW tables to your existing schema
# Your current tables (tickets, wards, worker_attendance, etc.) remain UNCHANGED
# Run this SQL in your Supabase SQL Editor:

-- Copy and paste the entire content of backend/setup_users_table.sql
```

**New Tables Created:**
- `auth_users` - Authentication user profiles
- `user_profiles` - Extended user information  
- `user_sessions` - Session management

**Existing Tables Enhanced:**
- `tickets` - Added `submitted_by_user_id` field
- `job_assignments` - Added user tracking fields
- `worker_attendance` - Added `auth_user_id` field

### **2. Backend Setup**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### **3. Frontend Setup**
```bash
cd frontend  
npm run dev
# Frontend runs on http://localhost:3000
```

### **4. Google OAuth Setup (Optional)**

To enable Google authentication:

**1. Configure Google OAuth in Supabase:**
- Go to Supabase Dashboard → Authentication → Providers
- Enable Google Provider
- Add your Google OAuth credentials (Client ID & Secret)
- Set authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**2. Google Console Setup:**
- Create project in Google Cloud Console
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized origins: `http://localhost:3000`, `https://yourdomain.com`
- Add authorized redirect URIs: Your Supabase redirect URI

### **5. Frontend Environment Variables**

**Frontend (.env.local):**
✅ Already created with API URL

## 🔧 **API Usage Examples**

### **Signup**
```javascript
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "CITIZEN"
}
```

### **Login**  
```javascript
POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "SecurePass123!"
}
```

### **Protected Route**
```javascript
GET /api/auth/profile
Headers: {
  "Authorization": "Bearer your-jwt-token"
}
```

## 🎨 **User Roles & Permissions**

### **CITIZEN**
- Report flood incidents
- View flood maps and alerts
- Access safety information
- Redirects to: `/citizen/dashboard`

### **WORKER**
- Manage assigned tasks
- Update incident status
- Access field tools
- Redirects to: `/worker/dashboard`

### **ADMIN**
- User management
- System analytics
- Worker coordination
- Redirects to: `/admin/dashboard`

## 🔐 **Security Features**

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Supabase handles securely
- **Role-Based Access**: Middleware protection
- **Input Validation**: Frontend + backend validation
- **CORS Protection**: Cross-origin security
- **Row Level Security**: Database-level protection

## 🎯 **User Flow**

1. **Landing Page** → Get Started button
2. **Login/Signup** → Form validation + API calls
3. **Google OAuth** → Popup window authentication (no page redirect)
4. **Role Selection** → Onboarding for new users
5. **Dashboard Redirect** → Based on user role
6. **Authentication** → JWT tokens stored securely

## 🛠 **Tech Stack**

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn UI components
- Lucide React icons

**Backend:**
- Node.js with Express
- Supabase for auth & database
- JWT tokens
- CORS enabled
- Environment variables

## 🚀 **Ready to Use!**

The authentication system is now fully functional:

1. ✅ **Backend API** is ready for authentication
2. ✅ **Frontend UI** connects to real backend
3. ✅ **Database schema** is provided
4. ✅ **Role-based routing** works end-to-end
5. ✅ **Security measures** are implemented

Just run your backend and frontend servers, and your FloodGuard AI authentication system is live!