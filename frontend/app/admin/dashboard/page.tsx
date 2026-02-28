'use client';

import { Shield, Users, BarChart3, Settings, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-900 p-2 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FloodGuard AI</h1>
              <p className="text-gray-600">Administrative Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
            <p className="text-gray-600">System Administrator</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
                <p className="text-xs text-green-600">↗ +12% this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Reports</p>
                <p className="text-2xl font-bold text-orange-600">34</p>
                <p className="text-xs text-red-600">↗ +3 since yesterday</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">18</p>
                <p className="text-xs text-green-600">85% resolution rate</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-teal-600">2.4h</p>
                <p className="text-xs text-green-600">↗ 15% improvement</p>
              </div>
              <Clock className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Manage citizen and worker accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">View system performance metrics</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">System Map</h3>
            <p className="text-sm text-gray-600">Monitor citywide flood status</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-sm text-gray-600">Configure system parameters</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Severe flooding on Highway 101</p>
                  <p className="text-sm text-gray-600">Reported by: John Smith</p>
                  <p className="text-xs text-gray-500">10 minutes ago</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Critical
                  </span>
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800 mt-2 w-full">
                    Assign Worker
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Standing water in Park District</p>
                  <p className="text-sm text-gray-600">Reported by: Maria Garcia</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Medium
                  </span>
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800 mt-2 w-full">
                    Review
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Clogged drain on Elm Street</p>
                  <p className="text-sm text-gray-600">Reported by: David Lee</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Low
                  </span>
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800 mt-2 w-full">
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Worker Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JD</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Jake Davis</p>
                    <p className="text-sm text-gray-600">Emergency Response Team</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Available
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">SW</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah Wilson</p>
                    <p className="text-sm text-gray-600">Maintenance Crew</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  On Task
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">MT</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mike Thompson</p>
                    <p className="text-sm text-gray-600">Field Inspector</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Emergency
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AL</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Anna Lopez</p>
                    <p className="text-sm text-gray-600">Drainage Specialist</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Off Duty
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}