'use client';

import { Shield, AlertTriangle, MapPin, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CitizenDashboard() {
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
              <p className="text-gray-600">Citizen Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
            <p className="text-gray-600">Citizen Dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Report Flood Risk</h3>
            <p className="text-sm text-gray-600">Submit flood observations in your area</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Flood Map</h3>
            <p className="text-sm text-gray-600">View real-time flood risk areas</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-teal-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Alerts</h3>
            <p className="text-sm text-gray-600">Get notified about flood warnings</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Safety Tips</h3>
            <p className="text-sm text-gray-600">Learn flood safety measures</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Minor flooding on Main St</p>
                  <p className="text-sm text-gray-600">Reported 2 hours ago</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Under Review
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Blocked storm drain</p>
                  <p className="text-sm text-gray-600">Reported yesterday</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Resolved
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Current Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="font-medium text-blue-900">Weather Advisory</p>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Heavy rain expected in your area over the next 24 hours
                </p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  <p className="font-medium text-green-900">All Clear</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  No immediate flood risks detected in your vicinity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}