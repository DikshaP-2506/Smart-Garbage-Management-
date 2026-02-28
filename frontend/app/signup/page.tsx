'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Shield, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { authAPI, handleAuthError } from '@/lib/auth';

export default function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password strength criteria
  const passwordCriteria = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });

    // Validation
    let hasErrors = false;
    
    if (!formData.fullName.trim()) {
      setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
      hasErrors = true;
    }
    
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      hasErrors = true;
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasErrors = true;
    } else if (!passwordCriteria.every(criteria => criteria.test(formData.password))) {
      setErrors(prev => ({ ...prev, password: 'Password does not meet requirements' }));
      hasErrors = true;
    }
    
    if (!formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasErrors = true;
    }

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      // 🟢 1️⃣ SIGN UP (Email + Password) - Use Supabase
      const result = await authAPI.signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: 'CITIZEN' // Default role for signup
      });
      
      if (result.error) {
        throw new Error(result.error);
      }

      setIsLoading(false);
      setShowSuccess(true);
      
      // Show success message for 3 seconds then redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setErrors(prev => ({ ...prev, email: errorMessage }));
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      // 🟢 3️⃣ CONTINUE WITH GOOGLE - Use Supabase OAuth  
      await authAPI.loginWithGoogle();
    } catch (error) {
      console.error('Google signup error:', error);
      const errorMessage = handleAuthError(error);
      if (errorMessage.includes('Popup blocked')) {
        setErrors(prev => ({ ...prev, email: 'Please allow popups and try again, or use email/password signup.' }));
      } else {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      }
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="bg-white border-gray-200 shadow-lg w-full max-w-[420px]">
          <CardContent className="p-8 text-center">
            <div className="bg-teal-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Verification email sent. Please check your inbox and follow the instructions to verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8 animate-in fade-in duration-500">
      <div className="w-full max-w-[420px]">
        {/* Logo and App Name */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-900 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-1">FloodGuard AI</h1>
          <p className="text-gray-600 text-sm">Protecting communities through technology</p>
        </div>

        {/* Signup Form Card */}
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Sign up to report and monitor flood risks</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`h-12 text-base ${errors.fullName ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-12 text-base pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 mb-1">Password requirements:</p>
                    {passwordCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {criteria.test(formData.password) ? (
                          <Check className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <X className="h-3 w-3 text-gray-400 mr-2" />
                        )}
                        <span className={criteria.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                          {criteria.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`h-12 text-base pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword}
                className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-medium text-base mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Signup Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}