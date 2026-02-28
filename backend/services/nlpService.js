import Groq from 'groq-sdk'
import dotenv from 'dotenv'

dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * Validate and analyse a citizen's report description using Groq LLaMA (free).
 * @param {string} text - The raw description to process
 * @returns {{ is_valid, waste_type, severity, drain_mentioned, translated_text }}
 */
export const processText = async (text) => {
  try {
    console.log('📝 Sending description to Groq NLP...')

    const prompt = `You are a waste-management complaint validator.
Analyze the text below and respond ONLY with a single valid JSON object — no markdown, no explanation.
Use exactly this structure:
{"is_valid":true,"waste_type":"plastic","severity":"medium","drain_mentioned":false,"translated_text":"Garbage pile near the road."}

Rules:
- is_valid: true ONLY if the text describes garbage, litter, waste, illegal dumping, blocked drain, or a related sanitation problem. Set false for spam, gibberish, or unrelated topics.
- waste_type: "plastic" | "organic" | "construction" | "mixed" | "unknown"
- severity: "low" | "medium" | "high"
- drain_mentioned: true if drain, gutter, sewer, or flooding is mentioned
- translated_text: translate the text to clear English if needed; otherwise return it as-is

Text to analyse: """${text}"""`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 256
    })

    const rawText = completion.choices?.[0]?.message?.content || ''
    console.log('🤖 Groq NLP raw:', rawText)

    // Strip accidental markdown fences
    const jsonText = rawText.replace(/```json|```/gi, '').trim()

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.warn('⚠️ Groq NLP returned non-JSON, defaulting to is_valid:false')
      parsed = { is_valid: false, waste_type: 'unknown', severity: 'low', drain_mentioned: false, translated_text: text }
    }

    return {
      is_valid: Boolean(parsed.is_valid),
      waste_type: parsed.waste_type || 'unknown',
      severity: parsed.severity || 'low',
      drain_mentioned: Boolean(parsed.drain_mentioned),
      translated_text: parsed.translated_text || text
    }

  } catch (error) {
    console.error('❌ Groq NLP Error:', error.message)
    throw error
  }
}