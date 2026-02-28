import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

export const getRainProbability = async (lat, lon) => {
  try {
    console.log("Calling weather API with:", lat, lon)

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat: lat,
          lon: lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    )

    const forecastList = response.data.list

    let maxRainProbability = 0

    forecastList.forEach(item => {
      if (item.pop && item.pop > maxRainProbability) {
        maxRainProbability = item.pop
      }
    })

    return {
      rain_probability: maxRainProbability * 100,
      raw_weather: response.data
    }

  } catch (error) {
    console.error("WEATHER ERROR:", error.response?.data || error.message)
    throw error
  }
}