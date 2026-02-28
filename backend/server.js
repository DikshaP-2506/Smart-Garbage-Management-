import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import processorRoute from './routes/processor.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/process', processorRoute)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
app.get('/', (req, res) => {
  res.send("Backend is running 🚀")
})