import { createClient } from "@deepgram/sdk"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

export const transcribeAudio = async (audioUrl) => {
  const audio = await axios.get(audioUrl, {
    responseType: "arraybuffer"
  })

  const response = await deepgram.listen.prerecorded.transcribe(
    audio.data,
    {
      model: "nova-2",
      smart_format: true
    }
  )

  return response.result.results.channels[0].alternatives[0].transcript
}