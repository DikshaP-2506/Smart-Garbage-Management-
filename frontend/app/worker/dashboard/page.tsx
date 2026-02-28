'use client';

import { Shield, Wrench, MapPin, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WorkerDashboard() {
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
              <p className="text-gray-600">Worker Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
            <p className="text-gray-600">Field Worker Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
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
                <p className="text-sm text-gray-600">Completed Today</p>
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
                <p className="text-sm text-gray-600">High Priority</p>
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
                <p className="text-sm text-gray-600">Team Members</p>
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
            <Wrench className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Update Task Status</h3>
            <p className="text-sm text-gray-600">Mark tasks as completed or in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Field Map</h3>
            <p className="text-sm text-gray-600">View assigned work locations</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Emergency Response</h3>
            <p className="text-sm text-gray-600">Handle urgent flood incidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Clear blocked storm drain</p>
                  <p className="text-sm text-gray-600">Location: Main St & 5th Ave</p>
                  <p className="text-xs text-red-600">High Priority</p>
                </div>
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                  Start Task
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Inspect flood barrier</p>
                  <p className="text-sm text-gray-600">Location: River Park</p>
                  <p className="text-xs text-yellow-600">Medium Priority</p>
                </div>
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                  Start Task
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Routine maintenance check</p>
                  <p className="text-sm text-gray-600">Location: Central District</p>
                  <p className="text-xs text-blue-600">Normal Priority</p>
                </div>
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                  Start Task
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
                  <p className="font-medium text-gray-900">Emergency pump deployment</p>
                  <p className="text-sm text-gray-600">Completed 1 hour ago</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sandbag distribution</p>
                  <p className="text-sm text-gray-600">Completed 3 hours ago</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Drainage system check</p>
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
  );
}