import { Recycle, Leaf, MapPin, Brain, Users, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedNavbar from '@/components/enhanced-navbar';
import Footer from '@/components/footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <EnhancedNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="SmartWaste - Intelligent Garbage Management"
              className="h-20 w-auto rounded-2xl shadow-2xl object-contain mb-6"
            />
            
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              <span className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your city with intelligent garbage management. Real-time monitoring, 
              optimized routes, and citizen engagement for a cleaner, greener tomorrow.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="px-8 py-4 bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 border-[#5770fe] text-[#5770fe] hover:bg-[#5770fe]/5 text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
