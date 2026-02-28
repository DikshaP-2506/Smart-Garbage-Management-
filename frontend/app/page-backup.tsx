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
          {/* Grey-white overlay for reduced transparency */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-gray-100/75 to-white/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div>
                <Badge className="bg-[#5770fe] text-white mb-4">
                  AI-Powered Smart Solution
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Intelligent Garbage Management for Smart Cities
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Transform waste management with AI-powered reporting, real-time analytics, and community engagement. Making cities cleaner, smarter, and more sustainable.
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
                  Learn More
                </Button>
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5770fe]">10K+</div>
                  <div className="text-sm text-gray-600">Reports Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5770fe]">98%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#5770fe]">50+</div>
                  <div className="text-sm text-gray-600">Cities Connected</div>
                </div>
              </div>
            </div>

            {/* Right Side - Placeholder for visual elements */}
            <div className="hidden lg:block">
              {/* This space is for the background image to show through */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Waste Management Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines artificial intelligence, community engagement, and real-time monitoring 
              to revolutionize how cities handle waste management and environmental protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900">AI-Powered Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced computer vision and machine learning algorithms automatically detect and classify waste types, 
                  drainage issues, and environmental hazards with high accuracy.
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
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-gray-900">Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive dashboards and reporting tools provide insights into waste patterns, 
                  response times, and environmental impact for data-driven decision making.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-gray-900">Smart Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Optimize collection routes and resource allocation based on real-time data. 
                  Reduce operational costs while improving service efficiency and response times.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-gray-900">24/7 Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Continuous monitoring and automated alerts ensure rapid response to environmental issues. 
                  Prevent problems before they escalate into larger concerns.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-gray-900">Sustainability Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Promote recycling, reduce waste, and track environmental impact. 
                  Support cities in achieving sustainability goals and carbon footprint reduction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your City's Waste Management?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Waste Management Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of AI to create smarter, cleaner, and more efficient waste management systems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-8 w-8" />,
                title: "AI-Powered Analytics",
                description: "Advanced machine learning algorithms optimize collection routes and predict waste patterns.",
                color: "text-purple-600 bg-purple-100"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "Smart Route Optimization",
                description: "Real-time route planning reduces fuel costs and improves collection efficiency by up to 40%.",
                color: "text-blue-600 bg-blue-100"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Citizen Engagement",
                description: "Easy reporting system empowers citizens to contribute to cleaner neighborhoods.",
                color: "text-green-600 bg-green-100"
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Real-time Monitoring",
                description: "Live dashboard tracking of bin levels, collection status, and operational metrics.",
                color: "text-orange-600 bg-orange-100"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure Platform",
                description: "Enterprise-grade security with role-based access for admins, workers, and citizens.",
                color: "text-red-600 bg-red-100"
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: "Environmental Impact",
                description: "Track carbon footprint reduction and promote sustainable waste management practices.",
                color: "text-emerald-600 bg-emerald-100"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#5770fe] to-[#320e2f]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of cities worldwide that have revolutionized their waste management with SmartWaste AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="px-8 py-4 bg-white text-[#5770fe] text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 border-blue-200 text-white hover:bg-[#320e2f] text-lg font-semibold"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
