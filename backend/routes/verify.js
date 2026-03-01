import express from 'express';
import supabase from '../config/supabaseClient.js';
import { verifyCleanup } from '../services/verificationService.js';

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kzbskltgojbawtbzsynj.supabase.co';

// Convert a storage path to full public URL (handles already-full URLs and base64)
const resolveImageUrl = (path, bucket = 'reports') => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/verify/:ticketId
// Module 7: AI Verification Auditor
// Compares before + after images, sets status CLOSED or REJECTED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  try {
    // 1. Fetch ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, status, before_image_path, after_image_path, description')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status !== 'COMPLETED' && ticket.status !== 'PENDING_VERIFICATION' && ticket.status !== 'REJECTED') {
      return res.status(400).json({
        error: `Ticket must be PENDING_VERIFICATION, COMPLETED, or REJECTED before verification (current: ${ticket.status})`,
      });
    }

    if (!ticket.before_image_path) {
      return res.status(400).json({ error: 'No before image on this ticket' });
    }

    if (!ticket.after_image_path) {
      return res.status(400).json({ error: 'No after image on this ticket' });
    }

    // 2. Resolve full URLs
    const beforeUrl = resolveImageUrl(ticket.before_image_path, 'reports');
    const afterUrl = resolveImageUrl(ticket.after_image_path, 'report-images');

    console.log(`🔍 Verifying ticket ${ticketId}`);
    console.log('  Before URL:', beforeUrl?.slice(0, 80));
    console.log('  After  URL:', afterUrl?.slice(0, 80));

    // 3. Run AI verification
    const result = await verifyCleanup(beforeUrl, afterUrl);

    console.log(`✅ Verdict: ${result.verdict} (confidence: ${(result.confidence * 100).toFixed(0)}%)`);

    // 4. Update ticket status + store verification metadata
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        status: result.verdict, // 'CLOSED' or 'REJECTED'
        verification_confidence: result.confidence,
        verification_reasoning: result.reasoning,
        verification_metadata: {
          confidence: result.confidence,
          is_clean: result.is_clean,
          landmarks_match: result.landmarks_match,
          drain_clear: result.drain_clear,
          verdict: result.verdict,
          reasoning: result.reasoning,
          verified_at: new Date().toISOString(),
        },
      })
      .eq('id', ticketId);

    if (updateError) {
      // Columns may not exist yet — try minimal update
      console.warn('Full update failed, trying status-only:', updateError.message);
      const { error: minimalError } = await supabase
        .from('tickets')
        .update({ status: result.verdict })
        .eq('id', ticketId);
      if (minimalError) throw minimalError;
    }

    // 5. If rejected, clear completed_at on the parent job so worker sees it as active again
    if (result.verdict === 'REJECTED') {
      const { data: link } = await supabase
        .from('job_tickets')
        .select('job_id')
        .eq('ticket_id', ticketId)
        .single();
      if (link?.job_id) {
        await supabase
          .from('jobs')
          .update({ completed_at: null })
          .eq('id', link.job_id);
        console.log(`↩️  Cleared completed_at on job ${link.job_id} — returned to worker as active`);
      }
    }

    return res.json({
      success: true,
      ticket_id: ticketId,
      verdict: result.verdict,
      confidence: result.confidence,
      confidence_pct: Math.round(result.confidence * 100),
      is_clean: result.is_clean,
      landmarks_match: result.landmarks_match,
      drain_clear: result.drain_clear,
      reasoning: result.reasoning,
    });
  } catch (err) {
    console.error('❌ POST /verify/:ticketId error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/verify/:ticketId/status
// Quick status check — returns current verdict without re-running AI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/:ticketId/status', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id, status, verification_confidence, verification_reasoning, verification_metadata')
      .eq('id', ticketId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Ticket not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
