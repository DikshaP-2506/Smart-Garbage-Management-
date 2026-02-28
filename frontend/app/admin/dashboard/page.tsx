'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Filter, MapPin, Users, Clock, CheckCircle, AlertTriangle, Plus, Play, Trash2 } from 'lucide-react';
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

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
  const [jobs, setJobs] = useState<JobWithTicketCount[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
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

  // Filter tickets based on status and date
  useEffect(() => {
    let filtered = tickets;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= filterDate;
      });
    }
    
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadTickets(),
        loadJobs()
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

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'NEW': return 'destructive';
      case 'OPEN': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-900 p-2 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
              <p className="text-gray-600">Admin Dashboard • Civic Issue Management</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">Admin User</p>
            <p className="text-sm text-gray-600">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
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
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="p-4 h-[calc(100vh-200px)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* Left Panel - Filters and Selected Tickets */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Filters */}
            <Card>
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
            <Card className="flex-1">
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
                        return (
                          <div key={ticketId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{displayTitle.slice(0, 20)}...</span>
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTicketSelect(ticketId, false)}
                                title="Deselect"
                              >
                                ×
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteTicket(ticketId)}
                                title="Delete from database"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
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
            <Card className="h-full">
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
            <Card className="h-full">
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

        </div>
      </div>
    </div>
  );
}