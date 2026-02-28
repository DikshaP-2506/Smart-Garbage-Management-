import { createClient } from "@deepgram/sdk"
import dotenv from "dotenv"

dotenv.config()

const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

// Transcribe audio from a raw buffer (webm/wav/mp3 etc.)
export const transcribeAudioBuffer = async (buffer, mimetype = 'audio/webm') => {
  const response = await deepgram.listen.prerecorded.transcribeFile(
    buffer,
    {
      model: 'nova-2',
      smart_format: true,
      detect_language: true
    }
  )

  const transcript = response.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript
  return transcript || ''
}
