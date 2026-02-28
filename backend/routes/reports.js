import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files for image field, any file for voice
    if (file.fieldname === 'image' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (file.fieldname === 'voiceNote' && file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else if (file.fieldname === 'voiceNote') {
      // Allow wav files even if mimetype is not detected correctly
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// 🎯 SUBMIT GEO-VERIFIED REPORT
router.post('/submit', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'voiceNote', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📝 Report submission started');
    
    // Get authenticated user from Supabase auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, ward_id')
      .eq('auth_users_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const {
      imageHash,
      imageSource,
      latitude,
      longitude,
      locationAccuracy,
      description,
      confidenceScore,
      classification,
      confidenceBreakdown,
      imageLatitude,
      imageLongitude,
      exifTimestamp
    } = req.body;

    // Validation
    if (!req.files?.image?.[0]) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!description || description.trim().length < 20) {
      if (!req.files?.voiceNote?.[0]) {
        return res.status(400).json({ error: 'Description (20+ characters) or voice note is required' });
      }
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'GPS location is required' });
    }

    if (!confidenceScore || !classification) {
      return res.status(400).json({ error: 'Confidence scoring is required' });
    }

    // 📸 UPLOAD IMAGE TO STORAGE
    const imageFile = req.files.image[0];
    const imageFileName = `reports/${user.id}/${Date.now()}-${imageFile.originalname}`;
    
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

    // 🎙 UPLOAD VOICE NOTE (if provided)
    let voiceNoteUrl = null;
    if (req.files?.voiceNote?.[0]) {
      const voiceFile = req.files.voiceNote[0];
      voiceNoteUrl = `data:audio/wav;base64,${voiceFile.buffer.toString('base64')}`;
    }

    // 🎯 CREATE TICKET RECORD
    console.log('💾 Creating ticket record...');
    
    const ticketData = {
      // Core report data - match your existing table structure
      description: description.trim(),
      priority: classification === 'high' ? 'HIGH' : 
               classification === 'medium' ? 'MEDIUM' : 'LOW',
      status: 'PENDING',
      
      // Link to user - adjust column name if different in your table
      citizen_id: profile.id,  // or user_id if that's what you use
      
      // Image data - newly added columns from your ALTER TABLE command
      before_image_path: imageUrl,  // Using existing column name
      image_hash: imageHash,
      image_source: imageSource,
      
      // Location data - existing columns
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_accuracy: parseFloat(locationAccuracy),
      
      // Image location data - newly added columns
      image_latitude: imageLatitude ? parseFloat(imageLatitude) : null,
      image_longitude: imageLongitude ? parseFloat(imageLongitude) : null,
      exif_timestamp: exifTimestamp ? new Date(exifTimestamp) : null,
      
      // Voice note (if you have this column)
      voice_transcript: voiceNoteUrl,
      
      // Confidence scoring - newly added columns
      confidence_score: parseFloat(confidenceScore),
      is_flagged: classification === 'flagged'
    };

    // Insert into your existing tickets table
    const { data: insertedTicket, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select('*')
      .single();

    if (ticketError) {
      console.error('Failed to insert ticket:', ticketError);
      return res.status(500).json({ 
        error: 'Failed to save report',
        details: ticketError.message 
      });
    }

    const ticket = insertedTicket;

    console.log('✅ Ticket created successfully:', ticket.id);

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
    // Get authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_data')
      .eq('auth_users_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get reports with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status;

    let reports = [];
    let totalCount = 0;

    // Fetch from your existing tickets table
    try {
      let query = supabase
        .from('tickets')
        .select(`
          id,
          description,
          status,
          priority,
          before_image_path,
          image_source,
          image_hash,
          latitude,
          longitude,
          location_accuracy,
          image_latitude,
          image_longitude,
          exif_timestamp,
          confidence_score,
          is_flagged,
          created_at
        `, { count: 'exact' })
        .eq('citizen_id', profile.id)  // Filter by user
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data: ticketsData, error: ticketsError, count } = await query;

      if (!ticketsError && ticketsData) {
        // Transform data to match frontend expectations
        reports = ticketsData.map(ticket => ({
          ticket_id: `TKT-${ticket.id}`, // Create a display ID
          title: `Flood Report #${ticket.id}`,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          classification: ticket.is_flagged ? 'flagged' : 'high',
          confidence_score: ticket.confidence_score || 0,
          image_url: ticket.before_image_path,
          voice_note_url: null, // Add if you have voice data
          latitude: ticket.latitude,
          longitude: ticket.longitude,
          created_at: ticket.created_at,
          updated_at: ticket.created_at
        }));
        totalCount = count || 0;
      } else {
        console.log('Tickets query error:', ticketsError);
        throw new Error('Tickets table query failed');
      }

    } catch (tableError) {
      console.log('Fetching from alternative storage...');
      
      // Fallback to profile user_data as backup
      if (profile.user_data && profile.user_data.reports) {
        const allReports = profile.user_data.reports || [];
        
        // Apply status filter
        let filteredReports = allReports;
        if (statusFilter && statusFilter !== 'ALL') {
          filteredReports = allReports.filter(report => report.status === statusFilter);
        }
        
        // Apply pagination
        totalCount = filteredReports.length;
        reports = filteredReports.slice(offset, offset + limit);
      } else {
        // Generate sample data for demo
        const sampleReports = [
          {
            ticket_id: 'TKT-DEMO-001',
            title: 'Sample Flood Report',
            description: 'This is a demonstration report showing the geo-verified submission system.',
            status: 'PENDING',
            priority: 'MEDIUM',
            classification: 'high',
            confidence_score: 85,
            image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzM3NDE1MSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCI+U2FtcGxlPC90ZXh0Pgo8L3N2Zz4K',
            voice_note_url: null,
            latitude: 23.5558,
            longitude: 87.2877,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        reports = sampleReports;
        totalCount = sampleReports.length;
      }
    }

    res.json({
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;