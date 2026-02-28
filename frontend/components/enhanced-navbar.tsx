'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Recycle, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EnhancedNavbarProps {
  userType?: 'admin' | 'citizen' | 'worker';
  userName?: string;
  userAvatar?: string;
}

export default function EnhancedNavbar({ userType = 'citizen', userName = 'User', userAvatar }: EnhancedNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard' },
          { href: '/admin/reports', label: 'Reports' },
          { href: '/admin/workers', label: 'Workers' },
          { href: '/admin/analytics', label: 'Analytics' },
        ];
      case 'worker':
        return [
          { href: '/worker/dashboard', label: 'Dashboard' },
          { href: '/worker/tasks', label: 'My Tasks' },
          { href: '/worker/routes', label: 'Routes' },
          { href: '/worker/reports', label: 'Reports' },
        ];
      default:
        return [
          { href: '/citizen/dashboard', label: 'Dashboard' },
          { href: '/citizen/report', label: 'Report Issue' },
          { href: '/citizen/track', label: 'Track Request' },
          { href: '/citizen/schedule', label: 'Collection Schedule' },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="SmartWaste - Intelligent Garbage Management" 
              className="h-10 w-auto rounded-lg shadow-md object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 -mt-1">Intelligent Garbage Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-[#5770fe] transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#5770fe] to-[#320e2f] transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-[#5770fe]/10">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white text-xs border-0">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-200">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#5770fe] hover:bg-[#5770fe]/5 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}