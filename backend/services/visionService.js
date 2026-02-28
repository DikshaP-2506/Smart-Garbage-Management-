import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * Analyze an image for garbage/waste using Groq Llama 4 Scout Vision (free).
 * @param {Buffer|string} imageInput - Raw image buffer OR a public URL string
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {{ has_garbage, waste_type, severity, drain_blocked, confidence }}
 */
export const analyzeImage = async (imageInput, mimeType = "image/jpeg") => {
  try {
    console.log("🖼️ Sending image to Groq Llama 4 Scout Vision...")

    let imageUrl

    if (Buffer.isBuffer(imageInput)) {
      imageUrl = `data:${mimeType};base64,${imageInput.toString("base64")}`
    } else {
      imageUrl = imageInput
    }

    const prompt = `You are a garbage detection AI for a smart city waste management system.
Look at this image and determine if it contains any garbage, waste, litter, trash, or illegal dumping.
Be GENEROUS — even a small amount of litter, plastic bags, paper, food waste, construction debris, or any kind of refuse counts as garbage.

Respond ONLY with a single valid JSON object. No markdown. No explanation. No code fences.
Exact format: {"has_garbage":true,"waste_type":"plastic","severity":"medium","drain_blocked":false,"confidence":0.9}

Fields:
- has_garbage: true if ANY garbage/litter/waste/dumping is visible, false only if completely clean
- waste_type: "plastic" | "organic" | "construction" | "mixed" | "none"
- severity: "low" | "medium" | "high"
- drain_blocked: true if waste is near or blocking a drain, gutter, or sewer
- confidence: 0.0 to 1.0`

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: prompt }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 512
    })

    const rawText = completion.choices?.[0]?.message?.content || ""
    console.log("🤖 Groq Vision raw:", rawText)

    const jsonText = rawText.replace(/```json|```/gi, "").trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.warn("⚠️ Vision returned non-JSON, defaulting to has_garbage:false")
      parsed = { has_garbage: false, waste_type: "none", severity: "low", drain_blocked: false, confidence: 0 }
    }

    return {
      has_garbage: Boolean(parsed.has_garbage),
      waste_type: parsed.waste_type || "none",
      severity: parsed.severity || "low",
      drain_blocked: Boolean(parsed.drain_blocked),
      confidence: parseFloat(parsed.confidence) || 0,
      raw: rawText
    }

  } catch (error) {
    console.error("❌ Groq Vision Error:", error.message)
    throw error
  }
}
