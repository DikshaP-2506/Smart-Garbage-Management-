'use client';

import { useEffect, useState, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Filter, MapPin, Users, Clock, CheckCircle, AlertTriangle, Plus, Play, Trash2, DollarSign, Recycle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Database } from '@/lib/supabase';
import { format } from 'date-fns';
import DashboardLayout from '@/components/dashboard-layout';

// Use actual database types from Supabase
type Ticket = Database['public']['Tables']['tickets']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type TicketStatus = Ticket['status'];
type JobStatus = Job['job_status'];

// Dynamically import the map component to avoid SSR issues
const AdminMapView = dynamic(() => import('@/components/admin/admin-map-view'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface TicketWithProfile extends Ticket {
  citizen?: Profile;
}

interface JobWithTicketCount extends Job {
  ticket_count?: number;
}

interface WasteAnalytics {
  summary: {
    total_revenue_potential_inr: number;
    total_estimated_weight_kg: number;
    tickets_with_value: number;
    total_tickets: number;
    avg_revenue_per_ticket: number;
  };
  material_breakdown: Record<string, number>;
  recent_valuable_tickets: Array<{
    id: string;
    created_at: string;
    location: string;
    waste_type: string;
    materials: string[];
    weight_kg: number;
    revenue_inr: number;
    breakdown: Array<{
      material: string;
      weight_kg: number;
      rate_per_kg: number;
      revenue: number;
    }>;
    confidence: number;
    status: string;
    priority: string;
  }>;
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
  const [jobs, setJobs] = useState<JobWithTicketCount[]>([]);
  const [wasteAnalytics, setWasteAnalytics] = useState<WasteAnalytics | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifyingTicket, setVerifyingTicket] = useState<string | null>(null);
  const [verifyResults, setVerifyResults] = useState<Record<string, { verdict: string; confidence_pct: number; reasoning: string; is_clean: boolean; landmarks_match: boolean; drain_clear: boolean }>>({});
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    const ticketsChannel = supabase
      .channel('tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket change:', payload);
          loadTickets();
        }
      )
      .subscribe();

    const jobsChannel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Job change:', payload);
          loadJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  // Filter tickets based on status, priority and date
  useEffect(() => {
    let filtered = tickets;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => (ticket as any).priority === priorityFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= filterDate;
      });
    }
    
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, priorityFilter, dateFilter]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadTickets(),
        loadJobs(),
        loadWasteAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      // First try with the join, if it fails, try without
      let { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          citizen:profiles!citizen_id(*)
        `)
        .order('created_at', { ascending: false });

      // If the join fails due to RLS, try without it
      if (error) {
        console.warn('Error with join, trying without profiles:', error);
        const result = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error loading tickets:', error);
        throw error;
      }
      
      console.log('Loaded tickets:', data?.length || 0);
      setTickets(data || []);
      
      // Log first ticket for debugging
      if (data && data.length > 0) {
        console.log('First ticket:', {
          id: data[0].id,
          status: data[0].status,
          lat: data[0].latitude,
          lng: data[0].longitude
        });
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error loading tickets",
        description: (error as Error)?.message || "Failed to load tickets from database",
        variant: "destructive",
      });
    }
  };

  const loadJobs = async () => {
    try {
      // First, load all jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      
      if (!jobsData || jobsData.length === 0) {
        setJobs([]);
        return;
      }

      // Then, get ticket counts for each job
      const jobsWithCounts = await Promise.all(
        jobsData.map(async (job) => {
          const { count, error: countError } = await supabase
            .from('job_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          
          return {
            ...job,
            ticket_count: countError ? 0 : (count || 0)
          };
        })
      );
      
      console.log('Loaded jobs with counts:', jobsWithCounts);
      setJobs(jobsWithCounts);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error loading jobs",
        description: (error as Error)?.message || "Failed to load jobs from database",
        variant: "destructive",
      });
    }
  };

  const loadWasteAnalytics = async () => {
    try {
      console.log('Loading waste analytics...');
      const response = await fetch('/api/reports/waste-value-analytics');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.analytics) {
        setWasteAnalytics(data.analytics);
        console.log('Loaded waste analytics:', data.analytics);
      } else {
        console.warn('Invalid waste analytics response format');
        setWasteAnalytics(null);
      }
    } catch (error) {
      console.error('Error loading waste analytics:', error);
      toast({
        title: "Error loading waste analytics", 
        description: (error as Error)?.message || "Failed to load waste value data",
        variant: "destructive",
      });
      setWasteAnalytics(null);
    }
  };

  const handleTicketSelect = (ticketId: string, selected: boolean) => {
    setSelectedTickets(prev => 
      selected 
        ? [...prev, ticketId]
        : prev.filter(id => id !== ticketId)
    );
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Delete this ticket permanently from the database?')) return;
    const { error } = await supabase.from('tickets').delete().eq('id', ticketId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete ticket: ' + error.message, variant: 'destructive' });
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
      toast({ title: 'Deleted', description: 'Ticket removed from database' });
      loadTickets();
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this job permanently from the database?')) return;
    // Delete linked job_tickets first, then the job
    await supabase.from('job_tickets').delete().eq('job_id', jobId);
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete job: ' + error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Job removed from database' });
      loadJobs();
    }
  };

  const createBatchJob = async () => {
    console.log('createBatchJob called with:', { selectedTickets: selectedTickets.length });
    
    if (selectedTickets.length === 0 || !newJobTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a job title and select at least one ticket",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating job...');
      
      // Create new job
      const { data: newJob, error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: newJobTitle,
          job_status: 'OPEN'
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job creation error - code:', jobError.code, '| message:', jobError.message, '| details:', jobError.details, '| hint:', jobError.hint);
        throw new Error(jobError.message || jobError.code || JSON.stringify(jobError));
      }
      
      console.log('Job created:', newJob);

      // Add tickets to job and update their status
      const jobTicketInserts = selectedTickets.map(ticketId => ({
        job_id: newJob.id,
        ticket_id: ticketId
      }));
      
      console.log('Inserting job_tickets:', jobTicketInserts);

      const { error: jobTicketsError } = await supabase
        .from('job_tickets')
        .insert(jobTicketInserts);

      if (jobTicketsError) {
        console.error('Job tickets insertion error:', jobTicketsError);
        throw jobTicketsError;
      }
      
      console.log('Job tickets linked successfully');

      // Update ticket statuses to OPEN
      console.log('Updating ticket statuses...');
      const { error: ticketUpdateError } = await supabase
        .from('tickets')
        .update({ status: 'OPEN' })
        .in('id', selectedTickets);

      if (ticketUpdateError) {
        console.error('Ticket update error:', ticketUpdateError);
        throw ticketUpdateError;
      }
      
      console.log('Tickets updated successfully');

      // Reset form and selections
      setSelectedTickets([]);
      setNewJobTitle('');
      setIsCreateJobOpen(false);

      toast({
        title: "Success",
        description: `Job created with ${selectedTickets.length} tickets assigned`,
      });

      // Reload data
      console.log('Reloading jobs and tickets...');
      loadJobs();
      loadTickets();

    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error creating job",
        description: (error as Error)?.message || "Failed to create job. Check browser console for details.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyTicket = async (ticketId: string) => {
    setVerifyingTicket(ticketId);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const r = await fetch(`${apiBase}/verify/${ticketId}`, { method: 'POST' });
      const text = await r.text();
      let d: any = {};
      try { d = JSON.parse(text); } catch { throw new Error(`Server error (${r.status})`); }
      if (!r.ok) throw new Error(d.error || 'Verification failed');
      setVerifyResults(prev => ({ ...prev, [ticketId]: d }));
      toast({
        title: d.verdict === 'CLOSED' ? '✅ Ticket CLOSED' : '⚠️ Ticket REJECTED',
        description: `Confidence: ${d.confidence_pct}% — ${d.reasoning}`,
        variant: d.verdict === 'CLOSED' ? 'default' : 'destructive',
      });
      loadTickets();
    } catch (e) {
      toast({ title: 'Verification Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setVerifyingTicket(null);
    }
  };

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return 'destructive';
      case 'OPEN': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
      case 'CLOSED' as any: return 'outline';
      case 'REJECTED' as any: return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return AlertTriangle;
      case 'OPEN': return Clock;
      case 'IN_PROGRESS': return Play;
      case 'COMPLETED': return CheckCircle;
      default: return Clock;
    }
  };

  const getJobStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case 'OPEN': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return { badge: 'bg-red-600 text-white',    icon: '🚨', label: 'CRITICAL' };
      case 'HIGH':     return { badge: 'bg-orange-500 text-white', icon: '🔴', label: 'HIGH' };
      case 'MEDIUM':   return { badge: 'bg-yellow-500 text-white', icon: '🟡', label: 'MEDIUM' };
      case 'LOW':      return { badge: 'bg-blue-500 text-white',   icon: '🔵', label: 'LOW' };
      default:         return { badge: 'bg-green-600 text-white',  icon: '🟢', label: 'NORMAL' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'NEW').length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tickets.filter(t => t.status === 'COMPLETED').length,
    critical: tickets.filter(t => (t as any).priority === 'CRITICAL').length,
    high: tickets.filter(t => (t as any).priority === 'HIGH').length,
    medium: tickets.filter(t => (t as any).priority === 'MEDIUM').length,
    drainBlocked: tickets.filter(t => (t as any).drain_blocked === true).length,
  };

  return (
    <DashboardLayout userType="admin" userName="Admin User">
      <div className="bg-gray-50 min-h-full">

      {/* Stats Row */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-9 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.new}</div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          {/* Divider */}
          <div className="hidden md:block border-l border-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            <div className="text-sm text-gray-600">🚨 Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
            <div className="text-sm text-gray-600">🔴 High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.drainBlocked}</div>
            <div className="text-sm text-gray-600">🚰 Drain Blocked</div>
          </div>
        </div>
      </div>

      {/* Waste-to-Wealth Analytics Row */}
      {wasteAnalytics && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Waste-to-Wealth Analytics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">₹{wasteAnalytics.summary.total_revenue_potential_inr.toFixed(2)}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Total Revenue Potential
              </div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{wasteAnalytics.summary.total_estimated_weight_kg.toFixed(1)} kg</div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Recycle className="h-4 w-4 mr-1" />
                Total Weight
              </div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{wasteAnalytics.summary.tickets_with_value}</div>
              <div className="text-sm text-gray-600">Valuable Tickets</div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">₹{wasteAnalytics.summary.avg_revenue_per_ticket.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Avg ₹/Ticket</div>
            </div>
            <div className="text-center bg-white p-3 rounded-lg shadow-sm">
              <div className="text-sm font-semibold text-gray-700 mb-1">Top Materials</div>
              <div className="text-xs text-gray-600 space-y-1">
                {Object.entries(wasteAnalytics.material_breakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([material, revenue]) => (
                    <div key={material} className="flex justify-between">
                      <span className="truncate">{material}</span>
                      <span>₹{revenue.toFixed(0)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left Panel - Filters and Selected Tickets */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Filters */}
            <Card className="h-fit bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={(value: TicketStatus | 'ALL') => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CLOSED">Closed ✅</SelectItem>
                      <SelectItem value="REJECTED">Rejected ⚠️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      <SelectItem value="CRITICAL">🚨 Critical</SelectItem>
                      <SelectItem value="HIGH">🔴 High</SelectItem>
                      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                      <SelectItem value="LOW">🔵 Low</SelectItem>
                      <SelectItem value="NORMAL">🟢 Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Tickets */}
            <Card className="flex-1 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Selected Tickets</CardTitle>
                <Badge variant="outline">{selectedTickets.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedTickets.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Click on map markers to select tickets
                  </p>
                ) : (
                  <>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {selectedTickets.map(ticketId => {
                        const ticket = tickets.find(t => t.id === ticketId);
                        if (!ticket) return null;
                        const StatusIcon = getStatusIcon(ticket.status);
                        const displayTitle = ticket.title || `Ticket ${ticket.id.slice(0, 8)}`;
                        const priority = (ticket as any).priority ?? 'NORMAL';
                        const ps = getPriorityStyle(priority);
                        const drainBlocked = (ticket as any).drain_blocked;
                        const rainProb = (ticket as any).rain_probability;
                        const wasteType = (ticket as any).waste_type;
                        const severity = (ticket as any).severity;
                        return (
                          <div key={ticketId} className="p-2 bg-gray-50 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                <StatusIcon className="h-3 w-3" />
                                <span className="text-xs font-medium truncate max-w-[100px]">{displayTitle.slice(0, 18)}…</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ps.badge}`}>
                                  {ps.icon} {ps.label}
                                </span>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleTicketSelect(ticketId, false)} title="Deselect">×</Button>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-500 hover:text-red-700" onClick={() => deleteTicket(ticketId)} title="Delete">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600">
                              {wasteType && <span>🗑 {wasteType}</span>}
                              {severity  && <span>📊 {severity}</span>}
                              {rainProb  != null && <span>🌧 {Number(rainProb).toFixed(1)}%</span>}
                              <span className={drainBlocked ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                🚰 {drainBlocked ? 'Drain blocked ⚠️' : 'Drain clear ✓'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={selectedTickets.length === 0}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Job ({selectedTickets.length} tickets)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[10000]">
                        <DialogHeader>
                          <DialogTitle>Create New Job</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Job Title</label>
                            <Input
                              value={newJobTitle}
                              onChange={(e) => setNewJobTitle(e.target.value)}
                              placeholder="Enter job title..."
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateJobOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={createBatchJob}>
                              Create Job
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Map */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="h-[520px] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Ticket Map - All Wards</span>
                  <Badge variant="outline">{filteredTickets.length} tickets</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] p-0">
                <AdminMapView
                  tickets={filteredTickets}
                  selectedTickets={selectedTickets}
                  onTicketSelect={handleTicketSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Active Jobs */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="h-[520px] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Active Jobs</span>
                  <Badge variant="outline">{jobs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto h-[calc(100%-80px)]">
                {jobs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No active jobs in this ward
                  </p>
                ) : (
                  jobs.map(job => (
                    <div key={job.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{job.title || `Job #${job.id.slice(0, 6).toUpperCase()}`}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant={getJobStatusBadgeVariant(job.job_status)}>
                            {job.job_status.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteJob(job.id)}
                            title="Delete job"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(job as any).ticket_count} tickets</span>
                        <span>{format(new Date(job.created_at), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

        </div>{/* end grid */}

        {/* FULL TICKET LIST */}
        <Card className="mt-4 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2">
              <span>All Tickets</span>
              <Badge variant="outline">{filteredTickets.length}</Badge>
              {priorityFilter !== 'ALL' && <Badge className="text-xs">Priority: {priorityFilter}</Badge>}
              {statusFilter !== 'ALL' && <Badge variant="secondary" className="text-xs">Status: {statusFilter}</Badge>}
            </CardTitle>
            <span className="text-xs text-gray-500">Click a row to select • sorted newest first</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-600 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Ticket ID</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Waste Type</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-center">🚰 Drain</th>
                    <th className="px-4 py-3 text-center">🌧 Rain %</th>
                    <th className="px-4 py-3 text-center">💰 Value ₹</th>
                    <th className="px-4 py-3 text-center">♻️ Weight</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.length === 0 ? (
                    <tr><td colSpan={13} className="text-center py-12 text-gray-400 text-sm">No tickets match current filters</td></tr>
                  ) : (
                    filteredTickets.map((ticket, idx) => {
                      const priority = (ticket as any).priority ?? 'NORMAL';
                      const ps = getPriorityStyle(priority);
                      const drainBlocked = (ticket as any).drain_blocked;
                      const rainProb = (ticket as any).rain_probability;
                      const wasteType = (ticket as any).waste_type;
                      const severity = (ticket as any).severity;
                      const estimatedRevenue = (ticket as any).estimated_revenue_inr ?? 0;
                      const estimatedWeight = (ticket as any).estimated_weight_kg ?? 0;
                      const recyclableMaterials = (ticket as any).recyclable_materials ?? [];
                      const isSelected = selectedTickets.includes(ticket.id);
                        const vr = verifyResults[ticket.id];
                        return (
                        <Fragment key={ticket.id}>
                        <tr
                          className={`transition-colors hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''} ${priority === 'CRITICAL' ? 'border-l-4 border-l-red-600' : priority === 'HIGH' ? 'border-l-4 border-l-orange-500' : priority === 'MEDIUM' ? 'border-l-4 border-l-yellow-400' : ''}`}
                          onClick={() => handleTicketSelect(ticket.id, !isSelected)}
                        >
                          <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${ps.badge}`}>{ps.icon} {ps.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-gray-600">{ticket.id.slice(0, 10)}…</span>
                            {(ticket.ticket_count ?? 1) > 1 && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1 rounded">×{ticket.ticket_count}</span>}
                          </td>
                          <td className="px-4 py-3 max-w-[200px]"><p className="text-xs text-gray-700 truncate">{ticket.description || '—'}</p></td>
                          <td className="px-4 py-3"><span className="capitalize text-xs">{wasteType ?? '—'}</span></td>
                          <td className="px-4 py-3">
                            <span className={`capitalize text-xs font-medium ${severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{severity ?? '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {drainBlocked ? <span className="text-red-600 font-bold text-xs">⚠️ YES</span> : <span className="text-green-600 text-xs">✓ No</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${rainProb >= 60 ? 'text-red-600' : rainProb >= 35 ? 'text-yellow-600' : 'text-blue-600'}`}>
                              {rainProb != null ? `${Number(rainProb).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {estimatedRevenue > 0 ? (
                              <span className="text-xs font-bold text-green-600" title={`Materials: ${recyclableMaterials.join(', ')}`}>
                                ₹{estimatedRevenue.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {estimatedWeight > 0 ? (
                              <span className="text-xs font-medium text-blue-600">
                                {estimatedWeight.toFixed(1)}kg
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={getStatusBadgeVariant(ticket.status)}
                              className={`text-xs w-fit ${
                                (ticket.status as string) === 'CLOSED' ? 'bg-green-100 text-green-800 border-green-300' :
                                (ticket.status as string) === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-300' : ''
                              }`}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{format(new Date(ticket.created_at), 'MMM d, HH:mm')}</td>
                          <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <Button variant={isSelected ? 'secondary' : 'outline'} size="sm" className="h-6 text-[10px] px-2" onClick={() => handleTicketSelect(ticket.id, !isSelected)}>
                                {isSelected ? '✓ Sel' : 'Select'}
                              </Button>
                              {(ticket.status as string) === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] px-2 bg-purple-600 hover:bg-purple-700 text-white"
                                  disabled={verifyingTicket === ticket.id}
                                  onClick={() => handleVerifyTicket(ticket.id)}>
                                  {verifyingTicket === ticket.id
                                    ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Verifying…</>
                                    : <><Sparkles className="h-3 w-3 mr-1" />AI Verify</>}
                                </Button>
                              )}
                              {(ticket.status as string) === 'REJECTED' && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] px-2 bg-orange-500 hover:bg-orange-600 text-white"
                                  disabled={verifyingTicket === ticket.id}
                                  onClick={() => handleVerifyTicket(ticket.id)}>
                                  {verifyingTicket === ticket.id
                                    ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Verifying…</>
                                    : <>↺ Re-Verify</>}
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteTicket(ticket.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {/* AI Verification result expansion row */}
                        {vr && (
                          <tr className={vr.verdict === 'CLOSED' ? 'bg-green-50' : 'bg-red-50'}>
                            <td colSpan={11} className="px-6 pb-4 pt-0" onClick={e => e.stopPropagation()}>
                              <div className={`rounded-xl border p-4 shadow-sm ${
                                vr.verdict === 'CLOSED'
                                  ? 'border-green-200 bg-white'
                                  : 'border-red-200 bg-white'
                              }`}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-lg font-extrabold tracking-wide ${
                                      vr.verdict === 'CLOSED' ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                      {vr.verdict === 'CLOSED' ? '✅ CLOSED' : '❌ REJECTED'}
                                    </span>
                                    <span className="text-xs text-gray-400">— AI Verification Report</span>
                                  </div>
                                  <button
                                    className="text-gray-400 hover:text-gray-600 text-xs underline"
                                    onClick={() => setVerifyResults(prev => { const n = {...prev}; delete n[ticket.id]; return n; })}>
                                    Dismiss
                                  </button>
                                </div>
                                {/* Confidence bar */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>AI Confidence</span>
                                    <span className="font-bold">{vr.confidence_pct}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        vr.verdict === 'CLOSED' ? 'bg-green-500' : vr.confidence_pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${vr.confidence_pct}%` }}
                                    />
                                  </div>
                                </div>
                                {/* Checks */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div className={`rounded-lg border px-3 py-2 text-center ${
                                    vr.is_clean ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                  }`}>
                                    <div className="text-xl">{vr.is_clean ? '🗑️✅' : '🗑️❌'}</div>
                                    <div className="text-[11px] font-semibold mt-1">{vr.is_clean ? 'Garbage Cleared' : 'Garbage Remains'}</div>
                                  </div>
                                  <div className={`rounded-lg border px-3 py-2 text-center ${
                                    vr.landmarks_match ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                  }`}>
                                    <div className="text-xl">{vr.landmarks_match ? '📍✅' : '📍❌'}</div>
                                    <div className="text-[11px] font-semibold mt-1">{vr.landmarks_match ? 'Same Location' : 'Location Mismatch'}</div>
                                  </div>
                                  <div className={`rounded-lg border px-3 py-2 text-center ${
                                    vr.drain_clear ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                  }`}>
                                    <div className="text-xl">{vr.drain_clear ? '🚰✅' : '🚰❌'}</div>
                                    <div className="text-[11px] font-semibold mt-1">{vr.drain_clear ? 'Drain Clear' : 'Drain Blocked'}</div>
                                  </div>
                                </div>
                                {/* Reasoning */}
                                <div className={`rounded-lg px-3 py-2 text-xs italic text-gray-700 ${
                                  vr.verdict === 'CLOSED' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                  <span className="font-semibold not-italic text-gray-500">AI reasoning: </span>
                                  {vr.reasoning}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}