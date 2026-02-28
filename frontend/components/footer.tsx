'use client';

import Link from 'next/link';
import { Recycle, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img 
              src="/logo.png" 
              alt="SmartWaste - Intelligent Garbage Management" 
              className="h-12 w-auto rounded-lg shadow-md object-contain"
            />
            <div className="ml-3">
              <p className="text-xs text-gray-400">Intelligent Garbage Management</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Revolutionary AI-powered waste management system helping cities become cleaner, 
              smarter, and more sustainable. Join us in creating a greener tomorrow.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-[#5770fe] transition-colors">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-[#5770fe] transition-colors">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-[#5770fe] transition-colors">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-[#5770fe] transition-colors">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#5770fe]">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/services', label: 'Services' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-[#5770fe] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#5770fe]">Services</h4>
            <ul className="space-y-2">
              {[
                'Waste Collection Scheduling',
                'Smart Bin Monitoring',
                'Route Optimization',
                'Environmental Analytics',
                'Citizen Reporting',
                'Administrative Dashboard',
              ].map((service) => (
                <li key={service}>
                  <span className="text-gray-400 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4 text-[#5770fe]">Stay Connected</h4>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#5770fe]" />
                <span className="text-gray-400 text-sm">support@smartwaste.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#5770fe]" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#5770fe]" />
                <span className="text-gray-400 text-sm">Smart City, Tech Hub 12345</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-white">Newsletter</h5>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#5770fe]"
                />
                <Button className="bg-[#5770fe] hover:bg-[#320e2f] transition-colors">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get updates on new features and sustainability tips.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>&copy; 2026 SmartWaste AI. All rights reserved.</span>
              <span>•</span>
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>for a cleaner planet</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-[#5770fe] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#5770fe] transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-[#5770fe] transition-colors">
                Cookies
              </Link>
              <Link href="/accessibility" className="hover:text-[#5770fe] transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}