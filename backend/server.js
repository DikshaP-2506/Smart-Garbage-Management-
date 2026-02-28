import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import processorRoute from './routes/processor.js'
import authRoute from './routes/auth.js'
import reportsRoute from './routes/reports.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Authentication routes
app.use('/api/auth', authRoute)

// Reports routes (Mandatory Reporting Engine)
app.use('/api/reports', reportsRoute)

// Other routes
app.use('/api/process', processorRoute)

app.listen(process.env.PORT, () => {
  console.log(`🚀 Smart Garbage Management Backend running on port ${process.env.PORT}`)
  console.log(`📊 Services available:`)
  console.log(`   - Authentication API: http://localhost:${process.env.PORT}/api/auth`)
  console.log(`   - Reports API: http://localhost:${process.env.PORT}/api/reports`)
  console.log(`   - Processing API: http://localhost:${process.env.PORT}/api/process`)
})
app.get('/', (req, res) => {
  res.send("Smart Garbage Management + FloodGuard AI Backend is running 🚀")
})