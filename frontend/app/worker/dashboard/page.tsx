'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Briefcase, CheckCircle, Clock, AlertTriangle, MapPin, Upload,
  RefreshCw, Wifi, WifiOff, ChevronDown, ChevronUp,
  Droplets, Loader2, Navigation, Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard-layout';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────
interface TicketInJob {
  id: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  waste_type: string | null;
  priority: string | null;
  drain_blocked: boolean | null;
  rain_probability: number | null;
  before_image_path: string | null;
  after_image_path: string | null;
  status: string | null;
}

interface JobData {
  id: string;
  title: string | null;
  job_status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  assigned_by: string | null;
  assigned_ward: number | null;
  accepted_by: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  tickets: TicketInJob[];
  ticket_count: number;
  distance_km: number | null;
  center_lat: number | null;
  center_lon: number | null;
  top_priority: string;
  drain_blocked_count: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SUPABASE_URL = 'https://kzbskltgojbawtbzsynj.supabase.co';

// Convert a storage path (e.g. "reports/abc.jpg") to a full public URL
// If it's already a full URL or base64, return as-is
const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/reports/${path}`;
};

const PRIORITY_COLOR: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  CRITICAL: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-l-red-600',    badge: 'bg-red-600 text-white' },
  HIGH:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-500', badge: 'bg-orange-500 text-white' },
  MEDIUM:   { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-l-yellow-400', badge: 'bg-yellow-400 text-black' },
  LOW:      { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-l-blue-400',   badge: 'bg-blue-400 text-white' },
  NORMAL:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-l-green-400',  badge: 'bg-green-500 text-white' },
};
const pc = (p: string) => PRIORITY_COLOR[p] || PRIORITY_COLOR.NORMAL;

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const { toast } = useToast();

  const [workerId, setWorkerId]     = useState<string | null>(null);
  const [workerName, setWorkerName] = useState('Worker');

  const [geoAllowed, setGeoAllowed] = useState<boolean | null>(null);
  const [workerLat, setWorkerLat]   = useState<number | null>(null);
  const [workerLon, setWorkerLon]   = useState<number | null>(null);

  const [availableJobs, setAvailableJobs] = useState<JobData[]>([]);
  const [myJobs, setMyJobs]               = useState<JobData[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const [activeTab, setActiveTab]       = useState<'available' | 'active' | 'history'>('available');
  const [expandedJob, setExpandedJob]   = useState<string | null>(null);
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);
  const [completingJob, setCompletingJob] = useState<string | null>(null);
  const [uploadingTicket, setUploadingTicket] = useState<string | null>(null);
  const [newJobNotif, setNewJobNotif]   = useState(false);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setWorkerId(user.id);
        const { data: profile } = await supabase
          .from('profiles').select('full_name').eq('auth_id', user.id).single();
        setWorkerName((profile as any)?.full_name || user.email?.split('@')[0] || 'Worker');
      } else {
        const fallbackId = localStorage.getItem('worker_id') || crypto.randomUUID();
        localStorage.setItem('worker_id', fallbackId);
        setWorkerId(fallbackId);
        setWorkerName('Field Worker');
      }
    };
    init();
  }, []);

  // ── GPS ───────────────────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoAllowed(false); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setWorkerLat(p.coords.latitude); setWorkerLon(p.coords.longitude); setGeoAllowed(true); },
      () => setGeoAllowed(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);
  useEffect(() => { requestLocation(); }, [requestLocation]);

  // ── Data loaders ──────────────────────────────────────────────────────────────
  // Safe JSON helper — avoids crash when backend returns HTML error page
  const safeJson = async (r: Response) => {
    const text = await r.text();
    try { return JSON.parse(text); } catch { return null; }
  };

  const loadAvailableJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (workerLat !== null) params.append('lat', String(workerLat));
      if (workerLon !== null) params.append('lon', String(workerLon));
      const r = await fetch(`${API}/jobs/available?${params}`);
      const d = await safeJson(r);
      setAvailableJobs(d?.jobs || []);
    } catch (e) { console.error('loadAvailableJobs:', e); }
  }, [workerLat, workerLon]);

  const loadMyJobs = useCallback(async () => {
    if (!workerId) return;
    try {
      const r = await fetch(`${API}/jobs/worker/${workerId}`);
      const d = await safeJson(r);
      setMyJobs(d?.jobs || []);
    } catch (e) { console.error('loadMyJobs:', e); }
  }, [workerId]);

  const loadAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    await Promise.all([loadAvailableJobs(), loadMyJobs()]);
    setLoading(false);
    if (showSpinner) setRefreshing(false);
  }, [loadAvailableJobs, loadMyJobs]);

  useEffect(() => { if (workerId) loadAll(); }, [workerId, workerLat, loadAll]);

  // ── Realtime subscription ──────────────────────────────────────────────────────
  useEffect(() => {
    const chan = supabase.channel('worker-jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (p) => {
        if ((p.new as any)?.job_status === 'OPEN') {
          setNewJobNotif(true);
          loadAvailableJobs();
          toast({ title: '🔔 New Job Broadcast!', description: 'A new job is available — check Available Jobs.' });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' }, () => {
        loadAvailableJobs(); loadMyJobs();
      })
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [loadAvailableJobs, loadMyJobs, toast]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const acceptJob = async (jobId: string) => {
    if (!workerId) return;
    setAcceptingJob(jobId);
    try {
      const r = await fetch(`${API}/jobs/${jobId}/accept`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      });
      const text = await r.text();
      let d: any = {};
      try { d = JSON.parse(text); } catch { throw new Error(`Server error (${r.status}): backend may not be running`); }
      if (!r.ok) throw new Error(d.error || 'Failed to accept job');
      toast({ title: '✅ Job Accepted!', description: `${d.ticket_ids?.length || 0} ticket(s) are now yours. Get to the site!` });
      setActiveTab('active');
      await loadAll();
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setAcceptingJob(null); }
  };

  const uploadAfterImage = async (jobId: string, ticketId: string, file: File) => {
    setUploadingTicket(ticketId);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('ticket_id', ticketId);
      const r = await fetch(`${API}/jobs/${jobId}/upload-after`, { method: 'POST', body: fd });
      const text2 = await r.text();
      let d: any = {};
      try { d = JSON.parse(text2); } catch { throw new Error(`Server error (${r.status}): backend may not be running`); }
      if (!r.ok) throw new Error(d.error || 'Upload failed');
      toast({ title: '📸 Photo uploaded!', description: 'After-work image saved.' });
      await loadMyJobs();
    } catch (e) {
      toast({ title: 'Upload Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setUploadingTicket(null); }
  };

  const completeJob = async (jobId: string) => {
    if (!workerId) return;
    setCompletingJob(jobId);
    try {
      const r = await fetch(`${API}/jobs/${jobId}/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId, notes: completionNotes[jobId] || '' }),
      });
      const text3 = await r.text();
      let d: any = {};
      try { d = JSON.parse(text3); } catch { throw new Error(`Server error (${r.status}): backend may not be running`); }
      if (!r.ok) throw new Error(d.error || 'Failed to complete job');
      toast({ title: '🎉 Job Completed!', description: `${d.completed_tickets} ticket(s) marked done.` });
      await loadAll();
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally { setCompletingJob(null); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const activeJob       = myJobs.find((j) => j.job_status === 'IN_PROGRESS');
  const completedJobs   = myJobs.filter((j) => j.job_status === 'COMPLETED');
  // Must have at least 1 ticket AND all tickets must have after images
  const allAfterDone    = (job: JobData) => job.tickets.length > 0 && job.tickets.every((t) => !!t.after_image_path);
  const openInMaps      = (lat?: number | null, lon?: number | null) => {
    if (lat && lon) window.open(`https://maps.google.com/?q=${lat},${lon}`, '_blank');
  };

  // ── Subcomponents ─────────────────────────────────────────────────────────────
  const PBadge = ({ p }: { p: string }) => (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pc(p).badge}`}>{p}</span>
  );

  const TicketRow = ({ ticket, jobId, forActive }: { ticket: TicketInJob; jobId: string; forActive?: boolean }) => (
    <div className={`rounded-lg border p-3 border-l-4 ${pc(ticket.priority || 'NORMAL').bg} ${pc(ticket.priority || 'NORMAL').border} space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            <PBadge p={ticket.priority || 'NORMAL'} />
            {ticket.drain_blocked && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">⚠️ Drain Blocked</span>}
            {ticket.waste_type    && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">{ticket.waste_type}</span>}
          </div>
          <p className="text-xs text-gray-700 truncate">{ticket.description || '(No description)'}</p>
          <div className="flex gap-3 mt-1 text-[10px] text-gray-500 flex-wrap">
            {ticket.rain_probability != null && (
              <span><Droplets className="inline h-3 w-3 mr-0.5" />{Number(ticket.rain_probability).toFixed(0)}% rain</span>
            )}
            {ticket.latitude && ticket.longitude && (
              <button className="text-blue-600 underline" onClick={() => openInMaps(ticket.latitude, ticket.longitude)}>
                <MapPin className="inline h-3 w-3 mr-0.5" />Maps
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {getImageUrl(ticket.before_image_path) && (
            <div className="text-center cursor-pointer" onClick={() => setLightboxUrl(getImageUrl(ticket.before_image_path))}>
              <img src={getImageUrl(ticket.before_image_path)!} alt="Before"
                className="h-14 w-14 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-[9px] text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">📷 Before</span>
            </div>
          )}
          {getImageUrl(ticket.after_image_path) && (
            <div className="text-center cursor-pointer" onClick={() => setLightboxUrl(getImageUrl(ticket.after_image_path))}>
              <img src={getImageUrl(ticket.after_image_path)!} alt="After"
                className="h-14 w-14 object-cover rounded border-2 border-green-400 hover:opacity-80 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-[9px] text-green-600 flex items-center justify-center gap-0.5 mt-0.5">✓ After</span>
            </div>
          )}
        </div>
      </div>

      {forActive && !ticket.after_image_path && (
        <>
          <input type="file" accept="image/*" capture="environment" className="hidden"
            ref={(el) => { fileInputRefs.current[ticket.id] = el; }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAfterImage(jobId, ticket.id, f); e.target.value = ''; }} />
          <Button size="sm" variant="outline" className="h-7 text-xs border-dashed w-full"
            disabled={uploadingTicket === ticket.id}
            onClick={() => fileInputRefs.current[ticket.id]?.click()}>
            {uploadingTicket === ticket.id
              ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading…</>
              : <><Upload className="h-3 w-3 mr-1" />Upload After Photo</>}
          </Button>
        </>
      )}
      {forActive && ticket.after_image_path && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" /> After photo saved
        </p>
      )}
    </div>
  );

  const JobCard = ({ job, mode }: { job: JobData; mode: 'available' | 'active' | 'history' }) => {
    // Active jobs always show tickets; others need a tap to expand
    const isExpanded = mode === 'active' || expandedJob === job.id;
    return (
      <Card className={`bg-white border-l-4 ${pc(job.top_priority).border} shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1 mb-1">
                <PBadge p={job.top_priority} />
                {job.drain_blocked_count > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">⚠️ {job.drain_blocked_count} drain blocked</span>
                )}
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {job.ticket_count} ticket{job.ticket_count !== 1 ? 's' : ''}
                </span>
                {mode === 'available' && job.distance_km !== null && (
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <Navigation className="inline h-3 w-3 mr-0.5" />
                    {job.distance_km < 1 ? `${(job.distance_km * 1000).toFixed(0)}m` : `${job.distance_km.toFixed(1)}km`} away
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{job.title || 'Untitled Job'}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'active' && job.accepted_at
                  ? `Accepted ${formatDistanceToNow(new Date(job.accepted_at))} ago`
                  : mode === 'history' && job.completed_at
                  ? `Completed ${format(new Date(job.completed_at), 'MMM d, HH:mm')}`
                  : `Broadcast ${formatDistanceToNow(new Date(job.created_at))} ago`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Maps button only for available/history — active mode has its own Step 2 navigate */}
              {mode !== 'active' && job.center_lat && job.center_lon && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => openInMaps(job.center_lat, job.center_lon)}>
                  <MapPin className="h-4 w-4 text-blue-500" />
                </Button>
              )}
              {/* Expand chevron only for available/history — active always shows steps */}
              {mode !== 'active' && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                  onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {mode === 'available' && (
            <Button size="sm" className="mt-3 w-full bg-blue-700 hover:bg-blue-800 text-white"
              disabled={acceptingJob === job.id} onClick={() => acceptJob(job.id)}>
              {acceptingJob === job.id
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Accepting…</>
                : <><Briefcase className="h-4 w-4 mr-2" />Accept Job</>}
            </Button>
          )}

          {/* ═══════════════════ ACTIVE JOB STEP-BY-STEP FLOW ═══════════════════ */}
          {mode === 'active' && (
            <div className="mt-4 space-y-3">

              {/* ── STEP 1: Attendance ── */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">1</span>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Team Attendance</p>
                </div>
                {job.accepted_at ? (
                  <div className="flex items-center gap-2 pl-6">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Checked in — attendance logged ✓</p>
                      <p className="text-[10px] text-green-600 mt-0.5">
                        Worker ID: <span className="font-mono">{workerId?.slice(0, 8)}…</span>
                        &nbsp;·&nbsp;{format(new Date(job.accepted_at), 'MMM d, yyyy · HH:mm')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-yellow-700 pl-6">Attendance not recorded yet</p>
                )}
              </div>

              {/* ── STEP 2: Navigate ── */}
              {job.center_lat && job.center_lon && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">2</span>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Navigate to Site</p>
                  </div>
                  <Button size="sm" variant="outline"
                    className="ml-6 h-7 text-xs border-blue-400 text-blue-700 hover:bg-blue-100"
                    onClick={() => openInMaps(job.center_lat, job.center_lon)}>
                    <MapPin className="h-3.5 w-3.5 mr-1" />Open in Google Maps
                  </Button>
                </div>
              )}

              {/* ── STEP 3: Upload after photos per ticket ── */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">3</span>
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Upload After Photos</p>
                  </div>
                  {job.tickets.length > 0 && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      allAfterDone(job) ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {job.tickets.filter(t => !!t.after_image_path).length}/{job.tickets.length} done
                    </span>
                  )}
                </div>
                {job.tickets.length === 0 ? (
                  <div className="ml-6 rounded bg-yellow-100 border border-yellow-300 p-2 text-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto mb-0.5" />
                    <p className="text-xs font-medium text-yellow-700">No tickets linked</p>
                    <p className="text-[10px] text-yellow-600">Ask admin to link tickets to this job.</p>
                  </div>
                ) : (
                  <div className="ml-6 space-y-2">
                    {job.tickets.map((t) => <TicketRow key={t.id} ticket={t} jobId={job.id} forActive={true} />)}
                  </div>
                )}
              </div>

              {/* ── STEP 4: Complete ── */}
              <div className={`rounded-lg border p-3 ${allAfterDone(job) ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 ${
                    allAfterDone(job) ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                  }`}>4</span>
                  <p className={`text-xs font-bold uppercase tracking-wide ${allAfterDone(job) ? 'text-green-700' : 'text-gray-500'}`}>
                    Mark Complete
                  </p>
                  {!allAfterDone(job) && job.tickets.length > 0 && (
                    <span className="text-[10px] text-gray-400 italic">— upload all photos first</span>
                  )}
                </div>
                <div className="ml-6 space-y-2">
                  <textarea className="w-full text-xs border rounded p-2 resize-none h-14"
                    placeholder="Completion notes (optional)…"
                    value={completionNotes[job.id] || ''}
                    onChange={(e) => setCompletionNotes((p) => ({ ...p, [job.id]: e.target.value }))} />
                  <Button size="sm"
                    className={`w-full text-white font-semibold ${
                      allAfterDone(job)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={completingJob === job.id || !allAfterDone(job)}
                    onClick={() => completeJob(job.id)}>
                    {completingJob === job.id
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Completing…</>
                      : job.tickets.length === 0
                      ? <><AlertTriangle className="h-4 w-4 mr-2" />No tickets linked</>
                      : allAfterDone(job)
                      ? <><CheckCircle className="h-4 w-4 mr-2" />Mark Job Complete</>
                      : <><Upload className="h-4 w-4 mr-2" />{job.tickets.filter(t => !t.after_image_path).length} photo(s) still pending</>}
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* Expand/collapse tickets for available + history modes only */}
          {mode !== 'active' && isExpanded && (
            <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tickets ({job.tickets.length})</p>
              {job.tickets.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No tickets linked.</p>
              ) : (
                job.tickets.map((t) => <TicketRow key={t.id} ticket={t} jobId={job.id} forActive={false} />)
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Loading Worker Dashboard…</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="worker" userName={workerName}>

      {/* ── Lightbox ── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}>
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none font-bold hover:text-gray-300"
            onClick={() => setLightboxUrl(null)}>✕</button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-700">{availableJobs.length}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">{activeJob ? 1 : 0}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{completedJobs.length}</div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>
      </div>

      {/* ── New job notification banner ── */}
      {newJobNotif && (
        <div className="flex items-center justify-between bg-yellow-50 border-b border-yellow-200 px-4 py-2 cursor-pointer"
          onClick={() => { setNewJobNotif(false); setActiveTab('available'); }}>
          <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
            <Bell className="h-4 w-4" /> New jobs broadcast! Tap to view.
          </div>
          <button className="text-yellow-600 text-xs underline"
            onClick={(e) => { e.stopPropagation(); setNewJobNotif(false); }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── Active Job spotlight (always shows if worker has one) ── */}
      {activeJob && (
        <div className="px-4 pt-4">
          <div className="border-2 border-orange-400 rounded-xl bg-orange-50 p-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-bold text-orange-700">Your Active Job</span>
            </div>
            <JobCard job={activeJob} mode="active" />
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4">
          {([
            { key: 'available', label: `Available (${availableJobs.length})`, icon: <Wifi className="h-3.5 w-3.5" /> },
            { key: 'active',    label: 'My Job',                              icon: <Clock className="h-3.5 w-3.5" /> },
            { key: 'history',   label: `Done (${completedJobs.length})`,      icon: <CheckCircle className="h-3.5 w-3.5" /> },
          ] as const).map(({ key, label, icon }) => (
            <button key={key}
              className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md transition-all
                ${activeTab === key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(key)}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Available Jobs */}
        {activeTab === 'available' && (
          <div className="space-y-3 pb-8">
            {availableJobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No open jobs right now</p>
                <p className="text-sm mt-1">Wait for admin to broadcast a job.</p>
                <Button variant="outline" size="sm" className="mt-4"
                  onClick={() => loadAll(true)} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
            ) : (
              <>
                {geoAllowed && (
                  <p className="text-xs text-gray-500 text-center -mt-1 mb-2">
                    <Navigation className="inline h-3 w-3 mr-1 text-blue-500" />
                    Sorted nearest to you first
                  </p>
                )}
                {availableJobs.map((j) => <JobCard key={j.id} job={j} mode="available" />)}
              </>
            )}
          </div>
        )}

        {/* Active tab */}
        {activeTab === 'active' && (
          <div className="pb-8">
            {!activeJob ? (
              <div className="text-center py-16 text-gray-400">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active job</p>
                <p className="text-sm mt-1">Accept one from Available Jobs.</p>
                <Button variant="outline" size="sm" className="mt-4"
                  onClick={() => setActiveTab('available')}>
                  Browse Available Jobs
                </Button>
              </div>
            ) : (
              <JobCard job={activeJob} mode="active" />
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-3 pb-8">
            {completedJobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No completed jobs yet</p>
              </div>
            ) : (
              completedJobs.map((job) => (
                <Card key={job.id} className="bg-white border-l-4 border-l-green-400 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-gray-900 text-sm">{job.title || 'Untitled Job'}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {job.ticket_count} ticket{job.ticket_count !== 1 ? 's' : ''} •{' '}
                          {job.completed_at ? format(new Date(job.completed_at), 'MMM d, yyyy HH:mm') : '—'}
                        </p>
                        {job.notes && <p className="text-xs text-gray-600 mt-1 italic">"{job.notes}"</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                        {expandedJob === job.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedJob === job.id && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                        {job.tickets.map((t) => (
                          <TicketRow key={t.id} ticket={t} jobId={job.id} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}