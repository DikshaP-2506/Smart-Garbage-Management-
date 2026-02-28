'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Users, Recycle, BarChart3, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedNavbar from '@/components/enhanced-navbar';
import Footer from '@/components/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <EnhancedNavbar />
      
      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/landing-page.png)',
          }}
        >
          {/* Grey-White Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-gray-100/60 to-gray-200/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left space-y-8">
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Smart Waste
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#5770fe] to-[#320e2f]">
                    Management
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                  Transform your city with AI-powered garbage management. Detect, analyze, and optimize waste collection with real-time intelligence and community engagement.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/get-started">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white px-8 py-4 text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 text-lg border-2 border-[#5770fe] text-[#5770fe] hover:bg-[#5770fe] hover:text-white transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Cities Served</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50M+</div>
                  <div className="text-sm text-gray-600">Reports Processed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Waste Management Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of AI, IoT, and community engagement to create cleaner, smarter cities. Our comprehensive platform transforms how waste is managed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900">AI-Powered Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced machine learning algorithms analyze waste patterns, predict collection needs, and optimize routes for maximum efficiency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-gray-900">Smart Collection Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Dynamic routing optimization reduces fuel costs by up to 40% while ensuring timely waste collection across all service areas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-gray-900">Community Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enable citizens to report issues, track progress, and earn rewards for environmental contributions. 
                  Build stronger community participation in city cleanliness initiatives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-gray-900">Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor bin levels, vehicle status, and operational metrics in real-time with our comprehensive dashboard and alert system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">Predictive Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Prevent equipment failures and reduce downtime with intelligent predictive maintenance algorithms and proactive scheduling.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-gray-900">Sustainability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track recycling rates, carbon footprint reduction, and environmental impact with detailed sustainability reporting and insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven Results Across Cities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform delivers measurable improvements in efficiency, cost reduction, and environmental impact for cities worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-[#5770fe] mb-2">40%</div>
              <div className="text-gray-600">Cost Reduction</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-[#320e2f] mb-2">60%</div>
              <div className="text-gray-600">Route Optimization</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-[#5770fe] mb-2">85%</div>
              <div className="text-gray-600">Citizen Satisfaction</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-[#320e2f] mb-2">30%</div>
              <div className="text-gray-600">Carbon Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#5770fe] to-[#320e2f]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of cities and communities already using our intelligent waste management platform. 
            Start making your city smarter, cleaner, and more sustainable today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button 
                size="lg" 
                className="bg-white text-[#5770fe] px-8 py-4 text-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#5770fe] transition-all duration-300"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}