'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DashboardLayout from '@/components/dashboard-layout';

interface Report {
  ticket_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  classification: string;
  confidence_score: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  // AI Analysis Data
  waste_type?: string;
  drain_blocked?: boolean;
  rain_probability?: number;
  weather_metadata?: any;
  severity?: string;
  translated_description?: string;
  is_flagged?: boolean;
  ticket_count?: number;
  voice_transcript?: string;
}

interface ReportStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: 'ALL',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  // Fetch all reports
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Hardcoded sample reports with full AI analysis data
      const sampleReports: Report[] = [
        {
          ticket_id: 'TKT-001',
          title: 'Report #12345678',
          description: 'Large pile of garbage blocking the drainage system near market area. Water is accumulating and creating unhygienic conditions.',
          status: 'PENDING',
          priority: 'HIGH',
          classification: 'flagged',
          confidence_score: 94,
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdrYWJhZ2UgQmxvY2tlZCBEcmFpbjwvdGV4dD48L3N2Zz4=',
          latitude: 19.0760,
          longitude: 72.8777,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          waste_type: 'Mixed Waste',
          drain_blocked: true,
          rain_probability: 78,
          weather_metadata: {
            city: 'Mumbai',
            rain_probability_pct: 78,
            fetched_at: new Date().toISOString()
          },
          severity: 'high',
          translated_description: 'Large pile of garbage blocking the drainage system near market area. Water is accumulating and creating unhygienic conditions.',
          is_flagged: true,
          ticket_count: 3,
          voice_transcript: null
        },
        {
          ticket_id: 'TKT-002',
          title: 'Report #23456789',
          description: 'Scattered plastic waste in park area',
          status: 'IN_PROGRESS',
          priority: 'NORMAL',
          classification: 'low',
          confidence_score: 87,
          image_url: null,
          latitude: 19.0823,
          longitude: 72.8831,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          waste_type: 'Plastic Waste',
          drain_blocked: false,
          rain_probability: 23,
          weather_metadata: null,
          severity: 'medium',
          translated_description: null,
          is_flagged: false,
          ticket_count: 1,
          voice_transcript: null
        },
        {
          ticket_id: 'TKT-003',
          title: 'Report #34567890',
          description: 'Overflowing garbage bin at bus stop',
          status: 'RESOLVED',
          priority: 'LOW',
          classification: 'low',
          confidence_score: 91,
          image_url: null,
          latitude: 19.0896,
          longitude: 72.8656,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          waste_type: 'Organic Waste',
          drain_blocked: false,
          rain_probability: 15,
          weather_metadata: {
            city: 'Mumbai',
            rain_probability_pct: 15,
            fetched_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          severity: 'low',
          translated_description: 'Overflowing garbage bin at bus stop - cleaned by maintenance team',
          is_flagged: false,
          ticket_count: 1,
          voice_transcript: null
        },
        {
          ticket_id: 'TKT-004',
          title: 'Report #45678901',
          description: 'Construction debris dumped illegally on roadside. This is blocking pedestrian path and creating traffic issues.',
          status: 'PENDING',
          priority: 'URGENT',
          classification: 'flagged',
          confidence_score: 89,
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbnN0cnVjdGlvbiBEZWJyaXM8L3RleHQ+PC9zdmc+',
          latitude: 19.1136,
          longitude: 72.8697,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          waste_type: 'Construction Debris',
          drain_blocked: false,
          rain_probability: 45,
          weather_metadata: null,
          severity: 'high',
          translated_description: 'Construction debris dumped illegally on roadside. This is blocking pedestrian path and creating traffic issues.',
          is_flagged: true,
          ticket_count: 1,
          voice_transcript: 'data:audio/mp3;base64,SAMPLE_AUDIO_DATA'
        }
      ];
      
      // Apply filters
      let filteredReports = [...sampleReports];
      
      if (filters.status !== 'ALL') {
        filteredReports = filteredReports.filter(report => report.status === filters.status);
      }
      
      if (filters.priority !== 'ALL') {
        filteredReports = filteredReports.filter(report => report.priority === filters.priority);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredReports = filteredReports.filter(report => 
          report.title.toLowerCase().includes(searchLower) ||
          report.description.toLowerCase().includes(searchLower) ||
          report.ticket_id.toLowerCase().includes(searchLower)
        );
      }
      
      setReports(filteredReports);
      setFilteredReports(filteredReports);
      
      // Calculate stats from filtered data
      const newStats = {
        total: sampleReports.length,
        pending: sampleReports.filter((r: Report) => r.status === 'PENDING').length,
        inProgress: sampleReports.filter((r: Report) => r.status === 'IN_PROGRESS').length,
        resolved: sampleReports.filter((r: Report) => r.status === 'RESOLVED').length,
        rejected: sampleReports.filter((r: Report) => r.status === 'REJECTED').length,
      };
      setStats(newStats);
      
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(filteredReports.length / pagination.limit)
      }));
      
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...reports];

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.ticket_id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  // Initial load
  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <AlertTriangle className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userType="admin" userName="Admin User">
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Management</h1>
          <p className="text-gray-600">Monitor and manage all citizen reports across the system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.resolved}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter Reports</span>
              <Button className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                onClick={() => fetchReports(pagination.currentPage)}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5770fe]"></div>
                          <span className="ml-2">Loading reports...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.ticket_id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {report.ticket_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {report.title}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(report.status)} border-0`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              {report.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(report.priority)} border-0`}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  report.confidence_score >= 80 ? 'bg-green-500' :
                                  report.confidence_score >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${report.confidence_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {report.confidence_score}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.latitude && report.longitude ? (
                            <Button variant="ghost" size="sm">
                              <MapPin className="h-4 w-4 text-[#5770fe]" />
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <span>{report.title}</span>
                                    {report.is_flagged && (
                                      <Badge className="bg-red-100 text-red-800 border-0">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Flagged
                                      </Badge>
                                    )}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* Basic Information */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        📋 Report Details
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div>
                                        <h4 className="font-medium mb-2">Description:</h4>
                                        <p className="text-gray-600 p-3 bg-gray-50 rounded-md">{report.description}</p>
                                      </div>
                                      {report.translated_description && report.translated_description !== report.description && (
                                        <div>
                                          <h4 className="font-medium mb-2">AI Translated Description:</h4>
                                          <p className="text-gray-600 p-3 bg-blue-50 rounded-md">{report.translated_description}</p>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <strong>Status:</strong> 
                                          <Badge className={`ml-2 ${getStatusColor(report.status)} border-0`}>
                                            {report.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <strong>Priority:</strong> 
                                          <Badge className={`ml-2 ${getPriorityColor(report.priority)} border-0`}>
                                            {report.priority}
                                          </Badge>
                                        </div>
                                        <div>
                                          <strong>Report Count:</strong> {report.ticket_count || 1} incident(s)
                                        </div>
                                        <div>
                                          <strong>Created:</strong> {new Date(report.created_at).toLocaleString()}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* AI Analysis Results */}
                                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        🤖 AI Analysis Results
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Confidence Score */}
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Detection Confidence:</h4>
                                          <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                              <div
                                                className={`h-3 rounded-full ${
                                                  report.confidence_score >= 80 ? 'bg-green-500' :
                                                  report.confidence_score >= 60 ? 'bg-yellow-500' :
                                                  'bg-red-500'
                                                }`}
                                                style={{ width: `${report.confidence_score}%` }}
                                              ></div>
                                            </div>
                                            <span className="font-bold text-lg">
                                              {report.confidence_score}%
                                            </span>
                                          </div>
                                        </div>

                                        {/* Waste Type */}
                                        <div>
                                          <h4 className="font-medium">Waste Type Detected:</h4>
                                          <Badge className="mt-1 bg-green-100 text-green-800 border-0">
                                            {report.waste_type || 'General Waste'}
                                          </Badge>
                                        </div>

                                        {/* Drainage Status */}
                                        <div>
                                          <h4 className="font-medium">Drainage Status:</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            {report.drain_blocked ? (
                                              <>
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                                <span className="text-red-600 font-medium">Drain Blocked</span>
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="text-green-600 font-medium">Drain Clear</span>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* Severity */}
                                        <div>
                                          <h4 className="font-medium">Issue Severity:</h4>
                                          <Badge className={`mt-1 border-0 ${
                                            report.severity === 'high' ? 'bg-red-100 text-red-800' :
                                            report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                          }`}>
                                            {(report.severity || 'medium').toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Weather & Risk Assessment */}
                                  {(report.rain_probability !== null || report.weather_metadata) && (
                                    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          🌧️ Weather Risk Assessment
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        {report.rain_probability !== null && (
                                          <div>
                                            <h4 className="font-medium">24-Hour Rain Probability:</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                <div
                                                  className={`h-3 rounded-full ${
                                                    report.rain_probability >= 70 ? 'bg-red-500' :
                                                    report.rain_probability >= 40 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                  }`}
                                                  style={{ width: `${report.rain_probability}%` }}
                                                ></div>
                                              </div>
                                              <span className="font-bold text-lg">
                                                {Math.round(report.rain_probability)}%
                                              </span>
                                            </div>
                                            {report.rain_probability >= 70 && report.drain_blocked && (
                                              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-md">
                                                <div className="flex items-center gap-2 text-red-700">
                                                  <AlertTriangle className="h-4 w-4" />
                                                  <span className="text-sm font-medium">HIGH FLOOD RISK DETECTED</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {report.weather_metadata && (
                                          <div className="text-sm text-gray-600">
                                            <strong>Weather Data:</strong> {report.weather_metadata.city || 'Local area'} - 
                                            Updated {new Date(report.weather_metadata.fetched_at || report.created_at).toLocaleString()}
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Image and Location */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {report.image_url && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">📷 Evidence Image</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <img 
                                            src={report.image_url} 
                                            alt="Report Evidence" 
                                            className="w-full max-w-md rounded-lg border shadow-sm"
                                          />
                                        </CardContent>
                                      </Card>
                                    )}
                                    
                                    {(report.latitude && report.longitude) && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Location Details
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div>
                                            <strong>Coordinates:</strong><br />
                                            <span className="font-mono text-sm">
                                              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                            </span>
                                          </div>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => window.open(
                                              `https://maps.google.com/?q=${report.latitude},${report.longitude}`,
                                              '_blank'
                                            )}
                                          >
                                            📍 View on Map
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>

                                  {/* Voice Transcript */}
                                  {report.voice_transcript && (
                                    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          🎤 Voice Note Transcript
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <audio 
                                          src={report.voice_transcript} 
                                          controls 
                                          className="w-full mb-3"
                                        />
                                        <p className="text-sm text-gray-600 italic">
                                          Audio automatically transcribed and processed by AI
                                        </p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-3 pt-4 border-t">
                                    <Button className="bg-gradient-to-r from-[#5770fe] to-[#320e2f] text-white">
                                      Update Status
                                    </Button>
                                    <Button variant="outline">
                                      Assign Worker
                                    </Button>
                                    <Button variant="outline">
                                      Add Notes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => fetchReports(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => fetchReports(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}