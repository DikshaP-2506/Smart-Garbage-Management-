import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

export const analyzeImage = async (imageUrl) => {
  try {
    console.log("Fetching image for HF...")

    // Download image as buffer
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer"
    })

    const imageBuffer = imageResponse.data

    console.log("Sending image to HuggingFace...")

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream"
        }
      }
    )

    console.log("HF Raw Response:", response.data)

    // HF returns array of predictions
    const predictions = response.data

    // Default values
    let wasteType = "None"
    let drainBlocked = false

    if (Array.isArray(predictions)) {
      const topLabel = predictions[0]?.label?.toLowerCase() || ""

      // Simple keyword logic
      if (
        topLabel.includes("trash") ||
        topLabel.includes("garbage") ||
        topLabel.includes("waste") ||
        topLabel.includes("plastic")
      ) {
        wasteType = "Mixed"
      }

      if (
        topLabel.includes("drain") ||
        topLabel.includes("sewer") ||
        topLabel.includes("gutter")
      ) {
        drainBlocked = true
      }
    }

    return {
      waste_type: wasteType,
      drain_blocked: drainBlocked
    }

  } catch (error) {
    console.error("HuggingFace Vision Error:", error.response?.data || error.message)
    throw error
  }
}