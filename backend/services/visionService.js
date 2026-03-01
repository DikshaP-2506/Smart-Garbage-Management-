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

/**
 * Estimate waste-to-wealth value using AI vision analysis
 * @param {Buffer|string} imageInput - Raw image buffer OR a public URL string
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {{ recyclable_materials, estimated_weight_kg, estimated_revenue_inr, breakdown }}
 */
export const estimateWasteValue = async (imageInput, mimeType = "image/jpeg") => {
  try {
    console.log("💰 Analyzing image for waste-to-wealth estimation...")

    let imageUrl

    if (Buffer.isBuffer(imageInput)) {
      imageUrl = `data:${mimeType};base64,${imageInput.toString("base64")}`
    } else {
      imageUrl = imageInput
    }

    const prompt = `You are a waste-to-wealth revenue estimator for municipal garbage management.
Analyze this image and identify recyclable materials that can be sold to recycling centers/kabadiwalas.

Focus on:
- PET bottles (plastic bottles)
- Cardboard/Paper
- Metal cans/aluminum
- Glass bottles
- Plastic containers

Estimate weight in kg and calculate revenue potential based on current Indian market rates:
- Plastic/PET bottles: ₹12/kg
- Cardboard: ₹8/kg  
- Aluminum cans: ₹180/kg
- Glass: ₹2/kg
- Mixed plastic: ₹10/kg

Respond ONLY with a single valid JSON object. No markdown. No explanation.
Format: {"recyclable_materials":["PET bottles","cardboard"],"estimated_weight_kg":2.5,"estimated_revenue_inr":85,"breakdown":[{"material":"PET bottles","weight_kg":1.5,"rate_per_kg":12,"revenue":18},{"material":"cardboard","weight_kg":1.0,"rate_per_kg":8,"revenue":8}],"confidence":0.8}

If no recyclable materials detected, return: {"recyclable_materials":[],"estimated_weight_kg":0,"estimated_revenue_inr":0,"breakdown":[],"confidence":1.0}`

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
    console.log("🤖 Waste Value AI raw:", rawText)

    const jsonText = rawText.replace(/```json|```/gi, "").trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.warn("⚠️ Waste Value AI returned non-JSON, defaulting to zero value")
      parsed = { 
        recyclable_materials: [], 
        estimated_weight_kg: 0, 
        estimated_revenue_inr: 0, 
        breakdown: [], 
        confidence: 0 
      }
    }

    return {
      recyclable_materials: parsed.recyclable_materials || [],
      estimated_weight_kg: parseFloat(parsed.estimated_weight_kg) || 0,
      estimated_revenue_inr: parseFloat(parsed.estimated_revenue_inr) || 0,
      breakdown: parsed.breakdown || [],
      confidence: parseFloat(parsed.confidence) || 0,
      raw: rawText
    }

  } catch (error) {
    console.error("❌ Waste Value Estimation Error:", error.message)
    throw error
  }
}
