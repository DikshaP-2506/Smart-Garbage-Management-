'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, ArrowRight, User, MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Onboarding() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const roles = [
    {
      id: 'CITIZEN',
      title: 'Citizen',
      description: 'Report flood risks, receive alerts, and access safety information',
      icon: User,
      color: 'bg-blue-500',
      features: ['Report flooding incidents', 'Receive emergency alerts', 'Access flood maps', 'Get safety tips']
    },
    {
      id: 'WORKER',
      title: 'Field Worker', 
      description: 'Respond to reports, manage tasks, and update incident status',
      icon: MapPin,
      color: 'bg-green-500',
      features: ['Manage assigned tasks', 'Update incident status', 'Access field maps', 'Emergency response tools']
    },
    {
      id: 'ADMIN',
      title: 'Administrator',
      description: 'Oversee system operations, manage users, and analyze data',
      icon: Bell,
      color: 'bg-purple-500',
      features: ['User management', 'System analytics', 'Report oversight', 'Worker coordination']
    }
  ];

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Save user role and redirect to appropriate dashboard
      switch (selectedRole) {
        case 'CITIZEN':
          router.push('/citizen/dashboard');
          break;
        case 'WORKER':
          router.push('/worker/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/citizen/dashboard');
      }
    }
  };

  const selectedRoleData = roles.find(role => role.id === selectedRole);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-900 p-4 rounded-full">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome to FloodGuard AI</h1>
          <p className="text-gray-600 text-lg">Let's get your account set up</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'} text-sm font-semibold`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-900' : 'bg-gray-200'} rounded`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'} text-sm font-semibold`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Role</h2>
                <p className="text-gray-600">Select the role that best describes how you'll use FloodGuard AI</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelection(role.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedRole === role.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`${role.color} p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                        <ul className="text-left text-sm text-gray-500 space-y-1">
                          {role.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 text-lg"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && selectedRoleData && (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className={`${selectedRoleData.color} p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
                  <selectedRoleData.icon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Setup Complete!</h2>
                <p className="text-gray-600">You've been assigned the role of <strong>{selectedRoleData.title}</strong></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Your {selectedRoleData.title} features include:</h3>
                <ul className="space-y-2">
                  {selectedRoleData.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleContinue}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team or{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 underline">
              return to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}