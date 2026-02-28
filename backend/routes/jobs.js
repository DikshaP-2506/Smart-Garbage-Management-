import express from 'express';
import multer from 'multer';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Haversine distance in km ─────────────────────────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Priority order helper ────────────────────────────────────────────────────
const PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NORMAL'];
const topPriority = (priorities) =>
  PRIORITY_ORDER.find((p) => priorities.includes(p)) || 'NORMAL';

// ── Attach tickets to a job ──────────────────────────────────────────────────
const attachTickets = async (job) => {
  const { data: links } = await supabase
    .from('job_tickets')
    .select('ticket_id')
    .eq('job_id', job.id);

  const ticketIds = (links || []).map((l) => l.ticket_id);
  let tickets = [];

  if (ticketIds.length > 0) {
    const { data } = await supabase
      .from('tickets')
      .select(
        'id, latitude, longitude, description, waste_type, priority, drain_blocked, rain_probability, before_image_path, after_image_path, status'
      )
      .in('id', ticketIds);
    tickets = data || [];
  }

  return { ...job, tickets, ticket_count: tickets.length };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/jobs/available?lat=&lon=
// Returns all OPEN jobs with embedded ticket info, sorted by distance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/available', async (req, res) => {
  try {
    const workerLat = req.query.lat ? parseFloat(req.query.lat) : null;
    const workerLon = req.query.lon ? parseFloat(req.query.lon) : null;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('job_status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!jobs || jobs.length === 0) return res.json({ jobs: [] });

    const enriched = await Promise.all(jobs.map(async (job) => {
      const withTickets = await attachTickets(job);
      const { tickets } = withTickets;

      // Compute weighted centre of all ticket locations
      let distance_km = null;
      let center_lat = null;
      let center_lon = null;

      if (tickets.length > 0) {
        center_lat = tickets.reduce((s, t) => s + (t.latitude || 0), 0) / tickets.length;
        center_lon = tickets.reduce((s, t) => s + (t.longitude || 0), 0) / tickets.length;

        if (workerLat !== null && workerLon !== null) {
          distance_km = haversine(workerLat, workerLon, center_lat, center_lon);
        }
      }

      return {
        ...withTickets,
        distance_km,
        center_lat,
        center_lon,
        top_priority: topPriority(tickets.map((t) => t.priority || 'NORMAL')),
        drain_blocked_count: tickets.filter((t) => t.drain_blocked).length,
      };
    }));

    // Sort nearest first (nulls last)
    enriched.sort((a, b) => {
      if (a.distance_km === null && b.distance_km === null) return 0;
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });

    res.json({ jobs: enriched });
  } catch (err) {
    console.error('GET /jobs/available error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/jobs/worker/:workerId
// Returns IN_PROGRESS + recent COMPLETED jobs for a specific worker
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('accepted_by', workerId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const enriched = await Promise.all((jobs || []).map(attachTickets));
    res.json({ jobs: enriched });
  } catch (err) {
    console.error('GET /jobs/worker/:workerId error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/jobs/:jobId/accept
// Worker accepts a broadcast job — locks it, logs attendance, updates tickets
// Body: { worker_id }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/:jobId/accept', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { worker_id } = req.body;

    if (!worker_id) return res.status(400).json({ error: 'worker_id is required' });

    // Fetch current job state
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) return res.status(404).json({ error: 'Job not found' });
    if (job.job_status !== 'OPEN') {
      return res.status(409).json({ error: 'This job has already been accepted or completed' });
    }

    // Lock job to this worker
    const { error: lockError } = await supabase
      .from('jobs')
      .update({
        job_status: 'IN_PROGRESS',
        accepted_by: worker_id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (lockError) throw lockError;

    // Log attendance
    await supabase.from('worker_attendance').insert({
      job_id: jobId,
      worker_id,
      role_in_team: 'lead',
      marked_at: new Date().toISOString(),
    });

    // Mark linked tickets IN_PROGRESS
    const { data: links } = await supabase
      .from('job_tickets')
      .select('ticket_id')
      .eq('job_id', jobId);

    const ticketIds = (links || []).map((l) => l.ticket_id);

    if (ticketIds.length > 0) {
      await supabase.from('tickets').update({ status: 'IN_PROGRESS' }).in('id', ticketIds);
    }

    res.json({
      success: true,
      message: 'Job accepted! Head to the location and get to work 💪',
      job_id: jobId,
      ticket_ids: ticketIds,
    });
  } catch (err) {
    console.error('POST /jobs/:jobId/accept error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/jobs/:jobId/upload-after
// Upload after-work image for a specific ticket in the job
// Multipart: image file + body { ticket_id }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/:jobId/upload-after', upload.single('image'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { ticket_id } = req.body;
    const imageFile = req.file;

    if (!ticket_id || !imageFile) {
      return res.status(400).json({ error: 'ticket_id and image file are required' });
    }

    const fileName = `after-images/${jobId}/${ticket_id}-${Date.now()}.jpg`;
    let imageUrl = `data:image/jpeg;base64,${imageFile.buffer.toString('base64')}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    } catch {
      console.log('Storage upload failed, using base64 fallback');
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .update({ after_image_path: imageUrl })
      .eq('id', ticket_id);

    if (updateError) throw updateError;

    res.json({ success: true, image_url: imageUrl, ticket_id });
  } catch (err) {
    console.error('POST /jobs/:jobId/upload-after error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/jobs/:jobId/complete
// Worker marks a job as completed — updates job + all linked tickets
// Body: { worker_id, notes? }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/:jobId/complete', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { worker_id, notes } = req.body;

    const { error: jobError } = await supabase
      .from('jobs')
      .update({
        job_status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        ...(notes ? { notes } : {}),
      })
      .eq('id', jobId);

    if (jobError) throw jobError;

    const { data: links } = await supabase
      .from('job_tickets')
      .select('ticket_id')
      .eq('job_id', jobId);

    const ticketIds = (links || []).map((l) => l.ticket_id);

    if (ticketIds.length > 0) {
      await supabase.from('tickets').update({ status: 'COMPLETED' }).in('id', ticketIds);
    }

    res.json({
      success: true,
      message: 'Job completed! Great work 🎉',
      completed_tickets: ticketIds.length,
    });
  } catch (err) {
    console.error('POST /jobs/:jobId/complete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
