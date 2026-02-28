import express from "express"
import multer from "multer"
import supabase from "../config/supabaseClient.js"
import axios from "axios"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post(
  "/",
  upload.fields([
    { name: "image" },
    { name: "audio" }
  ]),
  async (req, res) => {
    try {
      console.log("Files:", req.files)
      console.log("Body:", req.body)

      const imageFile = req.files?.image?.[0]

      if (!imageFile) {
        return res.status(400).json({ error: "Image missing" })
      }

      const { description_type, text, latitude, longitude } = req.body

      // ✅ Unique filename
      const fileName = `images/${Date.now()}-${imageFile.originalname}`

      // ✅ Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: false
        })

      if (uploadError) {
        console.log("Storage upload error:", uploadError)
        return res.status(500).json({
          error: "Image upload failed",
          details: uploadError
        })
      }

      if (!data) {
        return res.status(500).json({
          error: "Upload returned null data"
        })
      }

      const imagePath = data.path

      // ✅ Insert ticket
      const { data: ticket, error: insertError } =
        await supabase
          .from("tickets")
          .insert([
            {
              before_image_path: imagePath,
              description: text || null,
              description_type,
              latitude: latitude ? Number(latitude) : null,
              longitude: longitude ? Number(longitude) : null
            }
          ])
          .select()
          .single()

      if (insertError) {
        console.log("Insert error:", insertError)
        return res.status(500).json(insertError)
      }

      // ✅ Optional: Trigger Module 3 automatically
      // Insert ticket


// 🚀 Trigger Module 3
    try {
    await axios.post(
        `http://localhost:5000/api/process/${ticket.id}`
    )
    } catch (err) {
    console.log("Module 3 trigger failed:", err.message)
    }

    // Return response
    res.json({
    success: true,
    ticket_id: ticket.id,
    message: "Report submitted & AI processing started"
    })

    // 🔊 If voice mode, store audio
    if (description_type === "VOICE" && req.files?.audio) {

    const audioFile = req.files.audio[0]
    const audioFileName = `audio/${Date.now()}-${audioFile.originalname}`

    const { data: audioData, error: audioError } =
        await supabase.storage
        .from("reports")
        .upload(audioFileName, audioFile.buffer, {
            contentType: audioFile.mimetype
        })

    if (audioError) {
        console.log("Audio upload error:", audioError)
    } else {
        await supabase.from("voice_transcripts").insert([
        {
            ticket_id: ticket.id,
            original_audio_path: audioFileName,
            transcript_text: null
        }
        ])
    }
    }
     
    } catch (err) {
        console.error("🔥 FULL BACKEND ERROR:", err)
        res.status(500).json({
            error: "Upload failed",
            details: err.message
        })
        }
  }
)

export default router