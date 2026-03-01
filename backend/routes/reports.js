import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import supabase from '../config/supabaseClient.js';
import { transcribeAudioBuffer } from '../services/speechService.js';
import { analyzeImage, estimateWasteValue } from '../services/visionService.js';
import { processText } from '../services/nlpService.js';
import { getRainProbability } from '../services/weatherService.js';
import { calculateRisk } from '../services/riskEngine.js';

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
    // 💰  WASTE-TO-WEALTH ESTIMATOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let wasteValueResult = null;
    try {
      console.log('💰 Running Waste-to-Wealth estimation...');
      wasteValueResult = await estimateWasteValue(imageFile.buffer, imageFile.mimetype);
      console.log('✅ Waste value result:', wasteValueResult);
    } catch (wasteValueError) {
      console.warn('⚠️ Waste Value estimation failed — continuing without data:', wasteValueError.message);
      // Non-fatal: continue with zero value data
      wasteValueResult = { 
        recyclable_materials: [], 
        estimated_weight_kg: 0, 
        estimated_revenue_inr: 0, 
        breakdown: [], 
        confidence: 0 
      };
    }

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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌧️  MODULE 4 — Environmental Risk Engine
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let rainProbability = null;
    let weatherMetadata = null;
    let priority = 'NORMAL';

    try {
      console.log('🌧️ Fetching 24-hour rain forecast...');
      const weatherResult = await getRainProbability(parseFloat(latitude), parseFloat(longitude));
      rainProbability = weatherResult.rain_probability;
      weatherMetadata = weatherResult.raw_weather?.city
        ? {
            city: weatherResult.raw_weather.city.name,
            country: weatherResult.raw_weather.city.country,
            rain_probability_pct: rainProbability,
            fetched_at: new Date().toISOString()
          }
        : { rain_probability_pct: rainProbability, fetched_at: new Date().toISOString() };

      const drainBlocked = visionResult?.drain_blocked ?? false;
      const severity     = visionResult?.severity ?? 'low';
      priority = calculateRisk(drainBlocked, rainProbability, severity);

      console.log(`✅ Risk: priority=${priority}, rain=${rainProbability?.toFixed(1)}%, drain_blocked=${drainBlocked}`);
    } catch (weatherError) {
      console.warn('⚠️ Weather service unavailable — defaulting priority to NORMAL:', weatherError.message);
      // Non-fatal: ticket still created with NORMAL priority
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
        translated_description: nlpResult?.translated_text || null,
        // Module 4 — Environmental Risk Engine
        priority: priority,
        rain_probability: rainProbability ?? null,
        weather_metadata: weatherMetadata,
        // Waste-to-Wealth Estimation
        recyclable_materials: wasteValueResult?.recyclable_materials || [],
        estimated_weight_kg: wasteValueResult?.estimated_weight_kg || 0,
        estimated_revenue_inr: wasteValueResult?.estimated_revenue_inr || 0,
        waste_value_breakdown: wasteValueResult?.breakdown || [],
        waste_value_confidence: wasteValueResult?.confidence || 0
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
        isflagged: ticket.is_flagged || false,
        // AI + Risk Engine outputs
        priority: priority,
        rain_probability: rainProbability,
        drain_blocked: visionResult?.drain_blocked ?? false,
        waste_type: visionResult?.waste_type || null,
        severity: visionResult?.severity || null,
        weather_metadata: weatherMetadata,
        // Waste-to-Wealth Data
        recyclable_materials: wasteValueResult?.recyclable_materials || [],
        estimated_weight_kg: wasteValueResult?.estimated_weight_kg || 0,
        estimated_revenue_inr: wasteValueResult?.estimated_revenue_inr || 0,
        waste_value_breakdown: wasteValueResult?.breakdown || []
      },
      // Points and Rewards System
      points: {
        base_points: 50,
        bonus_points: calculateBonusPoints(priority, visionResult?.confidence_score, ticket.ticket_count === 1),
        total_points: 50 + calculateBonusPoints(priority, visionResult?.confidence_score, ticket.ticket_count === 1),
        achievement_unlocked: null,
        social_milestone_reached: false
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
      updated_at: ticket.created_at,
      // AI Analysis Data
      waste_type: ticket.waste_type,
      drain_blocked: ticket.drain_blocked,
      rain_probability: ticket.rain_probability,
      weather_metadata: ticket.weather_metadata,
      severity: ticket.severity || 'medium',
      translated_description: ticket.translated_description,
      is_flagged: ticket.is_flagged,
      ticket_count: ticket.ticket_count || 1,
      voice_transcript: ticket.voice_transcript
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

// 📈 GET ANALYTICS DATA
router.get('/analytics', async (req, res) => {
  try {
    const timeRange = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    // Fetch all tickets in the time range
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (ticketsError) {
      throw ticketsError;
    }

    // Calculate analytics
    const analytics = {
      summary: {
        total_reports: tickets.length,
        pending: tickets.filter(t => t.status === 'PENDING').length,
        in_progress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        rejected: tickets.filter(t => t.status === 'REJECTED').length,
        avg_confidence: tickets.length > 0 ? 
          tickets.reduce((acc, t) => acc + (t.confidence_score || 0), 0) / tickets.length : 0,
        flagged_reports: tickets.filter(t => t.is_flagged).length,
        duplicate_reports: tickets.filter(t => (t.ticket_count || 1) > 1).length
      },
      
      trends: {
        daily: generateDailyTrends(tickets, timeRange),
        weekly: generateWeeklyTrends(tickets),
        monthly: generateMonthlyTrends(tickets)
      },
      
      distributions: {
        by_status: generateStatusDistribution(tickets),
        by_priority: generatePriorityDistribution(tickets),
        by_waste_type: generateWasteTypeDistribution(tickets),
        by_severity: generateSeverityDistribution(tickets)
      },
      
      performance: {
        resolution_rate: tickets.length > 0 ? 
          (tickets.filter(t => t.status === 'RESOLVED').length / tickets.length) * 100 : 0,
        avg_resolution_time: calculateAvgResolutionTime(tickets),
        response_efficiency: calculateResponseEfficiency(tickets),
        ai_accuracy: tickets.length > 0 ? 
          tickets.reduce((acc, t) => acc + (t.confidence_score || 0), 0) / tickets.length : 0
      },
      
      geography: {
        hotspots: generateGeographicHotspots(tickets),
        coverage_areas: calculateCoverageAreas(tickets)
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Helper functions for analytics
function generateDailyTrends(tickets, days) {
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayString = date.toISOString().split('T')[0];
    
    const dayTickets = tickets.filter(ticket => 
      ticket.created_at.split('T')[0] === dayString
    );
    
    trends.push({
      date: dayString,
      total: dayTickets.length,
      resolved: dayTickets.filter(t => t.status === 'RESOLVED').length,
      pending: dayTickets.filter(t => t.status === 'PENDING').length,
      in_progress: dayTickets.filter(t => t.status === 'IN_PROGRESS').length
    });
  }
  return trends;
}

function generateWeeklyTrends(tickets) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.map((day, index) => ({
    day,
    count: tickets.filter(ticket => 
      new Date(ticket.created_at).getDay() === index
    ).length
  }));
}

function generateMonthlyTrends(tickets) {
  const monthlyData = {};
  tickets.forEach(ticket => {
    const month = new Date(ticket.created_at).toISOString().slice(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  
  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));
}

function generateStatusDistribution(tickets) {
  const distribution = {};
  tickets.forEach(ticket => {
    distribution[ticket.status] = (distribution[ticket.status] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([status, count]) => ({
    status,
    count,
    percentage: (count / tickets.length) * 100
  }));
}

function generatePriorityDistribution(tickets) {
  const distribution = {};
  tickets.forEach(ticket => {
    const priority = ticket.priority || 'NORMAL';
    distribution[priority] = (distribution[priority] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([priority, count]) => ({
    priority,
    count,
    percentage: (count / tickets.length) * 100
  }));
}

function generateWasteTypeDistribution(tickets) {
  const distribution = {};
  tickets.forEach(ticket => {
    const wasteType = ticket.waste_type || 'unknown';
    distribution[wasteType] = (distribution[wasteType] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([waste_type, count]) => ({
    waste_type,
    count,
    percentage: (count / tickets.length) * 100
  }));
}

function generateSeverityDistribution(tickets) {
  const distribution = {};
  tickets.forEach(ticket => {
    // Extract severity from metadata if available
    const severity = ticket.severity || 'medium';
    distribution[severity] = (distribution[severity] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([severity, count]) => ({
    severity,
    count,
    percentage: (count / tickets.length) * 100
  }));
}

function calculateAvgResolutionTime(tickets) {
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' && t.resolved_at);
  
  if (resolvedTickets.length === 0) return 0;
  
  const totalTime = resolvedTickets.reduce((sum, ticket) => {
    const created = new Date(ticket.created_at);
    const resolved = new Date(ticket.resolved_at);
    return sum + (resolved.getTime() - created.getTime());
  }, 0);
  
  return totalTime / resolvedTickets.length / (1000 * 60 * 60); // Convert to hours
}

function calculateResponseEfficiency(tickets) {
  const responded = tickets.filter(t => t.status !== 'PENDING').length;
  return tickets.length > 0 ? (responded / tickets.length) * 100 : 0;
}

function generateGeographicHotspots(tickets) {
  const hotspots = {};
  
  tickets.forEach(ticket => {
    if (ticket.latitude && ticket.longitude) {
      // Group by approximate location (rounded to 3 decimal places)
      const lat = Math.round(ticket.latitude * 1000) / 1000;
      const lng = Math.round(ticket.longitude * 1000) / 1000;
      const key = `${lat},${lng}`;
      
      if (!hotspots[key]) {
        hotspots[key] = {
          latitude: lat,
          longitude: lng,
          count: 0,
          tickets: []
        };
      }
      
      hotspots[key].count++;
      hotspots[key].tickets.push(ticket.id);
    }
  });
  
  return Object.values(hotspots)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 hotspots
}

function calculateCoverageAreas(tickets) {
  const validTickets = tickets.filter(t => t.latitude && t.longitude);
  
  if (validTickets.length === 0) {
    return { zones: 0, avg_density: 0 };
  }
  
  // Simple zone calculation based on geographic spread
  const lats = validTickets.map(t => t.latitude);
  const lngs = validTickets.map(t => t.longitude);
  
  const latRange = Math.max(...lats) - Math.min(...lats);
  const lngRange = Math.max(...lngs) - Math.min(...lngs);
  
  // Estimate zones based on geographic spread
  const estimatedZones = Math.ceil((latRange * lngRange) * 10000); // Rough calculation
  
  return {
    zones: Math.min(estimatedZones, 50), // Cap at 50 zones
    avg_density: validTickets.length / Math.max(estimatedZones, 1),
    geographic_spread: {
      lat_range: latRange,
      lng_range: lngRange
    }
  };
}

// Points and reward calculation functions
function calculateBonusPoints(priority, confidenceScore, isNewLocation) {
  let bonusPoints = 0;
  
  // Priority bonuses
  switch(priority) {
    case 'URGENT': bonusPoints += 30; break;
    case 'HIGH': bonusPoints += 20; break;
    case 'NORMAL': bonusPoints += 10; break;
    case 'LOW': bonusPoints += 5; break;
  }
  
  // Confidence score bonus (higher confidence = more points)
  if (confidenceScore) {
    if (confidenceScore >= 90) bonusPoints += 25;
    else if (confidenceScore >= 80) bonusPoints += 20;
    else if (confidenceScore >= 70) bonusPoints += 15;
    else if (confidenceScore >= 60) bonusPoints += 10;
  }
  
  // New location discovery bonus
  if (isNewLocation) {
    bonusPoints += 15;
  }
  
  return bonusPoints;
}

function checkAchievementUnlock(totalPoints, reportCount) {
  const achievements = [
    { id: 'first_reporter', threshold: 50, reports: 1, title: 'First Reporter' },
    { id: 'active_citizen', threshold: 200, reports: 5, title: 'Active Citizen' },
    { id: 'eco_warrior', threshold: 500, reports: 10, title: 'Eco Warrior' },
    { id: 'community_hero', threshold: 1000, reports: 20, title: 'Community Hero' },
    { id: 'environmental_champion', threshold: 2500, reports: 50, title: 'Environmental Champion' },
    { id: 'eco_ambassador', threshold: 5000, reports: 100, title: 'Eco Ambassador' }
  ];
  
  return achievements.find(achievement => 
    totalPoints >= achievement.threshold && reportCount >= achievement.reports
  );
}

function checkSocialMilestone(totalPoints) {
  const milestones = [3000, 5000, 10000];
  return milestones.includes(totalPoints);
}

// 💰 GET WASTE-TO-WEALTH ANALYTICS (Admin Dashboard)
router.get('/waste-value-analytics', async (req, res) => {
  try {
    console.log('💰 Fetching waste-to-wealth analytics...');
    
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id,
        created_at,
        status,
        priority,
        waste_type,
        recyclable_materials,
        estimated_weight_kg,
        estimated_revenue_inr,
        waste_value_breakdown,
        waste_value_confidence,
        latitude,
        longitude,
        description
      `)
      .not('estimated_revenue_inr', 'is', null)
      .gte('estimated_revenue_inr', 0)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waste value analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }

    // Calculate summary statistics
    const totalRevenuePotential = tickets.reduce((sum, ticket) => sum + (ticket.estimated_revenue_inr || 0), 0);
    const totalWeightEstimated = tickets.reduce((sum, ticket) => sum + (ticket.estimated_weight_kg || 0), 0);
    const ticketsWithValue = tickets.filter(t => (t.estimated_revenue_inr || 0) > 0).length;
    
    // Material breakdown
    const materialStats = {};
    tickets.forEach(ticket => {
      if (ticket.recyclable_materials && Array.isArray(ticket.recyclable_materials)) {
        ticket.recyclable_materials.forEach(material => {
          materialStats[material] = (materialStats[material] || 0) + (ticket.estimated_revenue_inr || 0);
        });
      }
    });

    const analytics = {
      summary: {
        total_revenue_potential_inr: totalRevenuePotential,
        total_estimated_weight_kg: totalWeightEstimated,
        tickets_with_value: ticketsWithValue,
        total_tickets: tickets.length,
        avg_revenue_per_ticket: ticketsWithValue > 0 ? (totalRevenuePotential / ticketsWithValue) : 0
      },
      material_breakdown: materialStats,
      recent_valuable_tickets: tickets
        .filter(t => (t.estimated_revenue_inr || 0) > 0)
        .slice(0, 10)
        .map(ticket => ({
          id: ticket.id,
          created_at: ticket.created_at,
          location: `${ticket.latitude}, ${ticket.longitude}`,
          waste_type: ticket.waste_type,
          materials: ticket.recyclable_materials,
          weight_kg: ticket.estimated_weight_kg,
          revenue_inr: ticket.estimated_revenue_inr,
          breakdown: ticket.waste_value_breakdown,
          confidence: ticket.waste_value_confidence,
          status: ticket.status,
          priority: ticket.priority
        }))
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Waste value analytics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;