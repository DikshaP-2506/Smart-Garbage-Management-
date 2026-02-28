'use client';

import Link from 'next/link';
import { Users, Shield, Wrench, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedNavbar from '@/components/enhanced-navbar';
import Footer from '@/components/footer';

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <EnhancedNavbar />
      
      <div className="flex-1 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          
          {/* Back to Home */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Role
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select your role to access the appropriate dashboard and features designed for your needs.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Citizen Role */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">Citizen</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-0">
                  Community Member
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Report waste issues, track your environmental impact, and earn rewards for making your community cleaner.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Submit waste reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Earn eco coins and rewards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Track environmental impact</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Social media recognition</span>
                  </div>
                </div>
                
                <Link href="/citizen/dashboard" className="block">
                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg transition-all duration-300">
                    Enter Citizen Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Worker Role */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-100 text-orange-800 border-0">
                  Coming Soon
                </Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">Worker</CardTitle>
                <Badge className="bg-orange-100 text-orange-800 border-0">
                  Field Operator
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Manage assigned tasks, optimize collection routes, and coordinate with the central management system.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">View assigned tasks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Optimize collection routes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Update task status</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Real-time coordination</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-gray-300 text-gray-500 cursor-not-allowed" 
                  disabled
                >
                  Worker Portal (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">Admin</CardTitle>
                <Badge className="bg-purple-100 text-purple-800 border-0">
                  System Manager
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Oversee operations, analyze system performance, and manage resources across the entire waste management network.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Monitor all reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Manage workers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">System configuration</span>
                  </div>
                </div>
                
                <Link href="/admin/dashboard" className="block">
                  <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all duration-300">
                    Enter Admin Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-[#5770fe]/5 to-[#320e2f]/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Help Choosing Your Role?
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Each role is designed with specific features and permissions to ensure you have the right tools for your responsibilities. 
                  Contact our support team if you need assistance determining the appropriate access level.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="border-[#5770fe] text-[#5770fe] hover:bg-[#5770fe] hover:text-white">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="border-[#5770fe] text-[#5770fe] hover:bg-[#5770fe] hover:text-white">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}