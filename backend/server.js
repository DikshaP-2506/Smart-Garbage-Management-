import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import processorRoute from './routes/processor.js'
import authRoute from './routes/auth.js'
import reportsRoute from './routes/reports.js'
import jobsRoute from './routes/jobs.js'
import verifyRoute from './routes/verify.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Authentication routes
app.use('/api/auth', authRoute)

// Reports routes (Mandatory Reporting Engine)
app.use('/api/reports', reportsRoute)

// Jobs API — worker accept/complete flow
app.use('/api/jobs', jobsRoute)

// Module 7: AI Verification Auditor
app.use('/api/verify', verifyRoute)

// Other routes
app.use('/api/process', processorRoute)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Smart Garbage Management Backend running on port ${PORT}`)
  console.log(`📊 Services available:`)
  console.log(`   - Authentication API: http://localhost:${PORT}/api/auth`)
  console.log(`   - Reports API: http://localhost:${PORT}/api/reports`)
  console.log(`   - Processing API: http://localhost:${PORT}/api/process`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill the existing process and restart.`)
  } else {
    console.error('❌ Server error:', err.message)
  }
  process.exit(1)
})

app.get('/', (req, res) => {
  res.send("Smart Garbage Management + FloodGuard AI Backend is running 🚀")
})

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception (server kept alive):', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection (server kept alive):', reason)
})