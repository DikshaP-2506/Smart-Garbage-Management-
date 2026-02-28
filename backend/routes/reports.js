import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import supabase from '../config/supabaseClient.js';
import { transcribeAudioBuffer } from '../services/speechService.js';
import { analyzeImage } from '../services/visionService.js';
import { processText } from '../services/nlpService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// 🎯 SUBMIT GEO-VERIFIED REPORT
router.post('/submit', upload.any(), async (req, res) => {
  try {
    console.log('📝 Report submission started');

    // Auth bypassed — no citizen_id needed
    const profile = { ward_id: null };

    const {
      imageHash,
      imageSource,
      latitude,
      longitude,
      locationAccuracy,
      confidenceBreakdown,
      imageLatitude,
      imageLongitude,
      exifTimestamp
    } = req.body;

    // Support both 'description' and 'text' field names
    let description = req.body.description || req.body.text || '';
    // Default confidence values if not provided
    const confidenceScore = req.body.confidenceScore || '0.5';
    const classification = req.body.classification || 'low';

    // Validation
    const imageFile = req.files?.find(f => f.fieldname === 'image');
    if (!imageFile) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'GPS location is required' });
    }

    // 📸 UPLOAD IMAGE TO STORAGE
    const imageFileName = `reports/${profile.id || 'anon'}/${Date.now()}-${imageFile.originalname}`;
    
    let imageUrl = `data:image/jpeg;base64,${imageFile.buffer.toString('base64')}`;
    
    // Try to upload to Supabase storage if available
    try {
      const { data: imageUpload, error: imageUploadError } = await supabase.storage
        .from('report-images')
        .upload(imageFileName, imageFile.buffer, {
          contentType: imageFile.mimetype
        });

      if (!imageUploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(imageFileName);
        imageUrl = publicUrl;
      }
    } catch (uploadError) {
      console.log('Using base64 image storage fallback');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖  AI GATE 1 — Gemini Vision: verify garbage present
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let visionResult = null;
    try {
      console.log('🖼️ Running Vision AI gate...');
      visionResult = await analyzeImage(imageFile.buffer, imageFile.mimetype);
      console.log('✅ Vision result:', visionResult);
    } catch (visionError) {
      console.error('❌ Vision AI error:', visionError.message);
      return res.status(503).json({
        rejected: true,
        reason: 'vision_unavailable',
        message: 'Image analysis service is currently unavailable. Please try again in a moment.'
      });
    }

    if (!visionResult || !visionResult.has_garbage) {
      console.log('🚫 Vision gate REJECTED — no garbage detected');
      return res.status(422).json({
        rejected: true,
        reason: 'vision_failed',
        message: 'No garbage or waste detected in the submitted image. Please upload a clear photo showing the waste.',
        confidence: visionResult?.confidence ?? 0,
        waste_type: visionResult?.waste_type ?? 'none'
      });
    }

    console.log(`✅ Vision gate PASSED — ${visionResult.waste_type}, severity: ${visionResult.severity}, drain_blocked: ${visionResult.drain_blocked}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎤  AI GATE 2 — Deepgram: transcribe audio (if any)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let voiceNoteUrl = null;
    const voiceFile = req.files?.find(f => f.fieldname === 'audio');
    if (voiceFile) {
      voiceNoteUrl = `data:audio/webm;base64,${voiceFile.buffer.toString('base64')}`;
      // Transcribe with Deepgram and use as description if no text provided
      try {
        console.log('🎤 Transcribing audio with Deepgram...');
        const transcript = await transcribeAudioBuffer(voiceFile.buffer, voiceFile.mimetype);
        console.log('✅ Transcript:', transcript);
        if (transcript && transcript.trim().length > 0) {
          // Use transcript as description (override empty/short text)
          if (!description || description.trim().length < 10) {
            description = transcript;
          }
        }
      } catch (transcribeError) {
        console.error('Deepgram transcription failed:', transcribeError.message);
        // Non-fatal — continue without transcript
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝  NLP enrichment (optional — does NOT block ticket)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let nlpResult = null;
    try {
      console.log('📝 Running NLP enrichment...');
      nlpResult = await processText(description || 'No description provided');
      console.log('✅ NLP result:', nlpResult);
      // Use translated/cleaned description if available
      if (nlpResult?.translated_text && nlpResult.translated_text.trim().length > 5) {
        description = nlpResult.translated_text;
      }
    } catch (nlpError) {
      console.warn('⚠️ NLP unavailable — continuing without enrichment:', nlpError.message);
      // Non-fatal: vision already confirmed garbage, proceed regardless
    }

    // 🎯 CREATE OR INCREMENT TICKET RECORD
    console.log('💾 Checking for existing ticket at same location...');

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const LOCATION_TOLERANCE = 0.0001; // ~10 metres

    // Look for an existing ticket at the same location
    const { data: existingTickets } = await supabase
      .from('tickets')
      .select('id, ticket_count')
      .gte('latitude', lat - LOCATION_TOLERANCE)
      .lte('latitude', lat + LOCATION_TOLERANCE)
      .gte('longitude', lng - LOCATION_TOLERANCE)
      .lte('longitude', lng + LOCATION_TOLERANCE)
      .in('status', ['NEW', 'OPEN', 'PENDING'])
      .order('created_at', { ascending: true })
      .limit(1);

    let ticket;

    if (existingTickets && existingTickets.length > 0) {
      // Same location: increment count on existing ticket
      const existing = existingTickets[0];
      const newCount = (existing.ticket_count || 1) + 1;
      console.log(`📍 Same location found (id: ${existing.id}), incrementing count to ${newCount}`);

      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({ ticket_count: newCount })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Failed to increment ticket count:', updateError);
        return res.status(500).json({ error: 'Failed to update ticket count', details: updateError.message });
      }

      ticket = updatedTicket;
      console.log(`✅ Ticket count incremented: ${ticket.id} → count: ${ticket.ticket_count}`);

    } else {
      // New location: create a new ticket
      console.log('💾 New location, creating ticket record...');

      const ticketData = {
        description: description.trim() || 'No description provided',
        description_type: 'TEXT',
        status: 'PENDING',
        citizen_id: null,
        ward_id: null,
        before_image_path: imageUrl,
        image_hash: imageHash || null,
        image_source: null,
        latitude: lat,
        longitude: lng,
        location_accuracy: parseFloat(locationAccuracy) || null,
        image_latitude: imageLatitude ? parseFloat(imageLatitude) : null,
        image_longitude: imageLongitude ? parseFloat(imageLongitude) : null,
        exif_timestamp: exifTimestamp ? new Date(exifTimestamp) : null,
        confidence_score: parseFloat(confidenceScore) || 0.5,
        is_flagged: classification === 'flagged',
        voice_transcript: voiceNoteUrl,
        ticket_count: 1,
        // AI-extracted fields
        waste_type: visionResult?.waste_type || nlpResult?.waste_type || null,
        drain_blocked: visionResult?.drain_blocked ?? nlpResult?.drain_mentioned ?? false,
        translated_description: nlpResult?.translated_text || null
      };

      const { data: insertedTicket, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('*')
        .single();

      if (ticketError) {
        console.error('Failed to insert ticket:', ticketError);
        return res.status(500).json({ error: 'Failed to save report', details: ticketError.message });
      }

      ticket = insertedTicket;
      console.log('✅ Ticket created successfully:', ticket.id);
    }

    // 📊 RETURN SUCCESS RESPONSE
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      ticket: {
        id: ticket.id,
        status: ticket.status || 'PENDING',
        confidenceScore: ticket.confidence_score || parseFloat(confidenceScore),
        classification: classification,
        createdAt: ticket.created_at || new Date().toISOString(),
        isflagged: ticket.is_flagged || false
      }
    });

  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// 🔍 CHECK FOR DUPLICATE IMAGES
router.post('/check-duplicate', async (req, res) => {
  try {
    const { imageHash } = req.body;
    
    if (!imageHash) {
      return res.status(400).json({ error: 'Image hash is required' });
    }

    const { data: existingTicket, error } = await supabase
      .from('tickets')
      .select('id, created_at, status')
      .eq('image_hash', imageHash)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      isDuplicate: !!existingTicket,
      existingTicket: existingTicket || null
    });

  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({ error: 'Failed to check for duplicates' });
  }
});

// 📊 GET USER'S REPORTS
router.get('/my-reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status;

    let query = supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data: ticketsData, error: ticketsError, count } = await query;

    if (ticketsError) {
      console.error('Tickets query error:', ticketsError);
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }

    const reports = (ticketsData || []).map(ticket => ({
      ticket_id: `TKT-${ticket.id}`,
      title: `Report #${ticket.id.slice(0, 8)}`,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      classification: ticket.is_flagged ? 'flagged' : 'low',
      confidence_score: ticket.confidence_score || 0,
      image_url: ticket.before_image_path,
      latitude: ticket.latitude,
      longitude: ticket.longitude,
      created_at: ticket.created_at,
      updated_at: ticket.created_at
    }));

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;