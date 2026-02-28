'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Users, MapPin, Clock, 
  CheckCircle, AlertTriangle, Calendar, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/dashboard-layout';

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  previous?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  date: string;
  reports: number;
  resolved: number;
  pending: number;
}

interface KPIMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

// Custom colors matching our theme
const COLORS = ['#5770fe', '#320e2f', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const RADIAN = Math.PI / 180;

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [reports, setReports] = useState<any[]>([]);
  
  // Analytics State
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [priorityData, setPriorityData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [frequencyData, setFrequencyData] = useState<ChartData[]>([]);
  const [kpiMetrics, setKPIMetrics] = useState<KPIMetric[]>([]);

  // Use hardcoded data for demonstration
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hardcoded analytics data for demonstration
      const hardcodedAnalytics = {
        summary: {
          total_reports: 1247,
          pending: 89,
          in_progress: 156,
          resolved: 945,
          rejected: 57,
          avg_confidence: 87.3,
          flagged_reports: 23,
          duplicate_reports: 12
        },
        distributions: {
          by_status: [
            { status: 'PENDING', count: 89, percentage: 7.1 },
            { status: 'IN_PROGRESS', count: 156, percentage: 12.5 },
            { status: 'RESOLVED', count: 945, percentage: 75.8 },
            { status: 'REJECTED', count: 57, percentage: 4.6 }
          ],
          by_priority: [
            { priority: 'LOW', count: 456, percentage: 36.6 },
            { priority: 'NORMAL', count: 623, percentage: 50.0 },
            { priority: 'HIGH', count: 134, percentage: 10.7 },
            { priority: 'URGENT', count: 34, percentage: 2.7 }
          ]
        },
        trends: {
          daily: generateHardcodedDailyData(timeRange),
          weekly: [
            { day: 'Sunday', count: 89 },
            { day: 'Monday', count: 245 },
            { day: 'Tuesday', count: 198 },
            { day: 'Wednesday', count: 267 },
            { day: 'Thursday', count: 234 },
            { day: 'Friday', count: 156 },
            { day: 'Saturday', count: 58 }
          ]
        },
        performance: {
          resolution_rate: 75.8,
          avg_resolution_time: 2.4,
          response_efficiency: 92.9,
          ai_accuracy: 87.3
        }
      };
      
      // Process analytics data for charts
      processAnalyticsData(hardcodedAnalytics);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHardcodedDailyData = (days: string) => {
    const numDays = parseInt(days);
    const dailyData = [];
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayString = date.toISOString().split('T')[0];
      
      // Generate realistic data with some variance
      const baseReports = Math.floor(Math.random() * 20) + 5;
      const resolved = Math.floor(baseReports * (0.6 + Math.random() * 0.3));
      const pending = Math.floor((baseReports - resolved) * 0.4);
      const inProgress = baseReports - resolved - pending;
      
      dailyData.push({
        date: dayString,
        total: baseReports,
        resolved: resolved,
        pending: pending,
        in_progress: Math.max(0, inProgress)
      });
    }
    
    return dailyData;
  };

  const processAnalyticsData = (analytics: any) => {
    // Process status data from backend
    const statusData = analytics.distributions.by_status.map((item: any) => ({
      name: item.status.replace('_', ' '),
      value: item.count,
      percentage: Math.round(item.percentage)
    }));
    setStatusData(statusData);

    // Process priority data
    const priorityData = analytics.distributions.by_priority.map((item: any) => ({
      name: item.priority,
      value: item.count,
      percentage: Math.round(item.percentage)
    }));
    setPriorityData(priorityData);

    // Process time series data from daily trends
    const timeSeriesData = analytics.trends.daily.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      reports: item.total,
      resolved: item.resolved,
      pending: item.pending
    }));
    setTimeSeriesData(timeSeriesData);

    // Process frequency data from weekly trends
    const frequencyData = analytics.trends.weekly.map((item: any) => ({
      name: item.day.substring(0, 3),
      value: item.count,
      percentage: Math.round((item.count / analytics.summary.total_reports) * 100)
    }));
    setFrequencyData(frequencyData);

    // Process KPI metrics
    const resolutionRate = analytics.performance.resolution_rate;
    const avgResolutionTime = analytics.performance.avg_resolution_time;
    const responseEfficiency = analytics.performance.response_efficiency;
    const aiAccuracy = analytics.performance.ai_accuracy;

    const metrics: KPIMetric[] = [
      {
        title: 'Total Reports',
        value: analytics.summary.total_reports.toString(),
        change: '+12% from last month',
        trend: 'up',
        icon: BarChart3,
        color: 'text-blue-600'
      },
      {
        title: 'Resolution Rate',
        value: `${Math.round(resolutionRate)}%`,
        change: analytics.summary.resolved > analytics.summary.pending ? '+5% from last month' : '-2% from last month',
        trend: analytics.summary.resolved > analytics.summary.pending ? 'up' : 'down',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Avg Response Time',
        value: avgResolutionTime > 0 ? `${Math.round(avgResolutionTime)} hrs` : '2.4 hrs',
        change: '-15 min from last month',
        trend: 'up',
        icon: Clock,
        color: 'text-purple-600'
      },
      {
        title: 'AI Confidence',
        value: `${Math.round(aiAccuracy || analytics.summary.avg_confidence || 0)}%`,
        change: '+3% from last month',
        trend: 'up',
        icon: Activity,
        color: 'text-orange-600'
      }
    ];

    setKPIMetrics(metrics);
  };

  const processStatusData = (reports: any[]) => {
    const statusCount = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count as number,
      percentage: Math.round(((count as number) / reports.length) * 100)
    }));

    setStatusData(statusData);
  };

  const processPriorityData = (reports: any[]) => {
    const priorityCount = reports.reduce((acc, report) => {
      acc[report.priority] = (acc[report.priority] || 0) + 1;
      return acc;
    }, {});

    const priorityData = Object.entries(priorityCount).map(([priority, count]) => ({
      name: priority,
      value: count as number,
      percentage: Math.round(((count as number) / reports.length) * 100)
    }));

    setPriorityData(priorityData);
  };

  const processTimeSeriesData = (reports: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const timeSeriesData = last30Days.map(date => {
      const dayReports = reports.filter(report => 
        report.created_at.split('T')[0] === date
      );

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reports: dayReports.length,
        resolved: dayReports.filter(r => r.status === 'RESOLVED').length,
        pending: dayReports.filter(r => r.status === 'PENDING').length
      };
    });

    setTimeSeriesData(timeSeriesData);
  };

  const processFrequencyData = (reports: any[]) => {
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const frequencyCount = reports.reduce((acc, report) => {
      const day = new Date(report.created_at).getDay();
      const dayName = dayOfWeek[day];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});

    const frequencyData = dayOfWeek.map(day => ({
      name: day.substring(0, 3),
      value: frequencyCount[day] || 0,
      percentage: Math.round(((frequencyCount[day] || 0) / reports.length) * 100)
    }));

    setFrequencyData(frequencyData);
  };

  const processKPIMetrics = (reports: any[]) => {
    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;
    const pendingReports = reports.filter(r => r.status === 'PENDING').length;
    const avgConfidence = reports.reduce((acc, r) => acc + (r.confidence_score || 0), 0) / totalReports;
    
    // Calculate resolution rate
    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;
    
    const metrics: KPIMetric[] = [
      {
        title: 'Total Reports',
        value: totalReports.toString(),
        change: '+12% from last month',
        trend: 'up',
        icon: BarChart3,
        color: 'text-blue-600'
      },
      {
        title: 'Resolution Rate',
        value: `${Math.round(resolutionRate)}%`,
        change: '+5% from last month',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Avg Response Time',
        value: '2.4 hrs',
        change: '-15 min from last month',
        trend: 'up',
        icon: Clock,
        color: 'text-purple-600'
      },
      {
        title: 'AI Confidence',
        value: `${Math.round(avgConfidence || 0)}%`,
        change: '+3% from last month',
        trend: 'up',
        icon: Activity,
        color: 'text-orange-600'
      }
    ];

    setKPIMetrics(metrics);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin" userName="Admin User">
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5770fe] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin" userName="Admin User">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into system performance and trends</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white"
              onClick={fetchAnalyticsData}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        {metric.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {metric.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br from-[#5770fe]/10 to-[#320e2f]/10 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Reports Over Time */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#5770fe]" />
                Reports Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5770fe" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#5770fe" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="reports" 
                    stroke="#5770fe"
                    fillOpacity={1}
                    fill="url(#colorReports)"
                    name="Total Reports" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                    name="Resolved Reports" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#5770fe]" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Analysis */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#5770fe]" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5770fe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Frequency Analysis */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#5770fe]" />
                Report Frequency by Day of Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#320e2f" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Coverage Area</h3>
                <p className="text-3xl font-bold text-blue-800 mb-2">15</p>
                <p className="text-sm text-blue-600">Active Zones Monitored</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Efficiency Rate</h3>
                <p className="text-3xl font-bold text-green-800 mb-2">94.2%</p>
                <p className="text-sm text-green-600">Reports Successfully Processed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-purple-800 mb-2">2,847</p>
                <p className="text-sm text-purple-600">Citizens Engaged This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}