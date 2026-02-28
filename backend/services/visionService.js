import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

export const analyzeImage = async (imageUrl) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [
          { text: "Analyze this image. 1. Is there trash? 2. Is it blocking a drain? 3. What type of waste?" },
          { file_data: { file_uri: imageUrl } }
        ]
      }]
    }
  )

  return response.data
}