import express from 'express'
import supabase from '../config/supabaseClient.js'
import { analyzeImage } from '../services/visionService.js'
import { processText } from '../services/nlpService.js'
import { transcribeAudio } from '../services/speechService.js'
import { getRainProbability } from '../services/weatherService.js'
import { calculateRisk } from '../services/riskEngine.js'

const router = express.Router()

// ✅ MAIN PROCESSOR
router.post('/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params
    console.log("🔥 MODULE 3 STARTED:", ticketId)

    // 1️⃣ Fetch ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error || !ticket) {
      console.log("Ticket fetch error:", error)
      return res.status(404).json({ error: "Ticket not found" })
    }

    // 2️⃣ Convert image path to public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('reports')
      .getPublicUrl(ticket.before_image_path)

    const publicImageUrl = publicUrlData.publicUrl

    console.log("Public Image URL:", publicImageUrl)

    // 3️⃣ Vision AI
    const visionResult = await analyzeImage(publicImageUrl)

    console.log("Vision Result:", visionResult)

    const wasteType = visionResult?.waste_type || null
    const drainBlocked = visionResult?.drain_blocked ?? null

    // 4️⃣ NLP (if text exists)
    let translatedText = null
    if (ticket.description) {
      const nlpResult = await processText(ticket.description)
      translatedText = nlpResult?.translated_text || null
    }

    // 5️⃣ Weather API
    const weatherData = await getRainProbability(
      ticket.latitude,
      ticket.longitude
    )

    const rainProbability = weatherData?.rain_probability || 0

    // 6️⃣ Risk Logic
    const priority = calculateRisk(drainBlocked, rainProbability)

    console.log("Calculated Priority:", priority)

    // 7️⃣ UPDATE DATABASE 🔥🔥🔥
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        waste_type: wasteType,
        drain_blocked: drainBlocked,
        translated_description: translatedText,
        rain_probability: rainProbability,
        weather_metadata: weatherData,
        priority: priority,
        status: "OPEN"
      })
      .eq('id', ticketId)

    if (updateError) {
      console.log("Update error:", updateError)
      return res.status(500).json(updateError)
    }

    console.log("✅ Ticket updated successfully")

    res.json({ success: true })

  } catch (err) {
    console.error("🔥 MODULE 3 CRASH:", err.response?.data || err.message)
    res.status(500).json({
      error: "Processing failed",
      details: err.response?.data || err.message
    })
  }
})

export default router