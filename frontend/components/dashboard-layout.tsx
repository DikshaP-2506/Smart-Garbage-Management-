'use client';

import React from 'react';
import EnhancedNavbar from './enhanced-navbar';
import Footer from './footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: 'admin' | 'citizen' | 'worker';
  userName?: string;
  userAvatar?: string;
}

export default function DashboardLayout({ 
  children, 
  userType = 'citizen', 
  userName = 'User',
  userAvatar 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <EnhancedNavbar 
        userType={userType} 
        userName={userName} 
        userAvatar={userAvatar} 
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}