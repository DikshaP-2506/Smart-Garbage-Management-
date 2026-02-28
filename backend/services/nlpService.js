import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

export const processText = async (text) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: `Translate to English and extract:
          waste_type, severity, drain_mentioned.
          Text: ${text}`
        }]
      }]
    }
  )

  return response.data
}