'use client';

import { Truck, Wrench, MapPin, Users, CheckCircle, Clock, AlertTriangle, Recycle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard-layout';

export default function WorkerDashboard() {
  return (
    <DashboardLayout userType="worker" userName="Mike Worker">
      <div className="bg-gray-50 min-h-full p-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Collections</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Collections Today</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent Issues</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Team Size</p>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Collection Route</h3>
              <p className="text-sm text-gray-600">View and manage collection routes</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Map</h3>
              <p className="text-sm text-gray-600">Track bins and navigation</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Report Issue</h3>
              <p className="text-sm text-gray-600">Report problems or maintenance needs</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Today's Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Overflowing bins - Oak Street</p>
                    <p className="text-sm text-gray-600">Route: A-12 • 15 bins</p>
                    <p className="text-xs text-red-600">Urgent</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Route
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Residential Area - West Side</p>
                    <p className="text-sm text-gray-600">Route: B-07 • 28 bins</p>
                    <p className="text-xs text-yellow-600">Scheduled 10:00 AM</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Route
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Commercial District</p>
                    <p className="text-sm text-gray-600">Route: C-03 • 22 bins</p>
                    <p className="text-xs text-blue-600">Scheduled 2:00 PM</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Start Route
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Morning Route A-08</p>
                    <p className="text-sm text-gray-600">Completed 1 hour ago • 32 bins</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completed
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Industrial Zone Collection</p>
                    <p className="text-sm text-gray-600">Completed 3 hours ago • 18 bins</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Truck maintenance check</p>
                    <p className="text-sm text-gray-600">In progress</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    In Progress
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}