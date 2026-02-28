import express from 'express'
import supabase from '../config/supabaseClient.js'
import { analyzeImage } from '../services/visionService.js'
import { processText } from '../services/nlpService.js'
import { transcribeAudio } from '../services/speechService.js'

const router = express.Router()

// ✅ 1️⃣ CREATE TEST TICKET ROUTE (PUT THIS FIRST)
router.post('/create-test', async (req, res) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      before_image_path: "https://example.com/test.jpg",
      description: "Bhaiya yaha bohot kachra hai aur naali block hai",
      description_type: "TEXT",
      latitude: 19.0760,
      longitude: 72.8777,
      is_location_verified: false
      // ❌ DO NOT SEND status
      // ❌ DO NOT SEND priority
    }])
    .select()

  if (error) {
    console.log(error)
    return res.status(400).json(error)
  }

  res.json(data)
})

// ✅ 2️⃣ MAIN AI PROCESSOR ROUTE
router.post('/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error || !ticket) {
      return res.status(404).json({ error: "Ticket not found" })
    }

    let finalText = ticket.description

    if (ticket.description_type === "VOICE") {
      const { data: voiceData } = await supabase
        .from('voice_transcripts')
        .select('*')
        .eq('ticket_id', ticketId)
        .single()

      if (!voiceData) {
        return res.status(400).json({ error: "Voice record not found" })
      }

      const transcript = await transcribeAudio(voiceData.original_audio_path)

      await supabase
        .from('voice_transcripts')
        .update({ transcript_text: transcript })
        .eq('ticket_id', ticketId)

      finalText = transcript
    }

    const visionResult = await analyzeImage(ticket.before_image_path)
    const wasteType = visionResult.waste_type
    const drainBlocked = visionResult.drain_blocked

    const nlpResult = await processText(finalText)
    const translatedText = nlpResult.translated_text

    await supabase
      .from('tickets')
      .update({
        waste_type: wasteType,
        drain_blocked: drainBlocked,
        translated_description: translatedText,
        status: "AI_PROCESSED"
      })
      .eq('id', ticketId)

    res.json({
      success: true,
      message: "Ticket processed successfully"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Processing failed" })
  }
})

export default router