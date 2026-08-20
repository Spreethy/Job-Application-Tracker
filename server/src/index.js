require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const applicationRoutes = require('./routes/applicationRoutes')
const profileRoutes = require('./routes/profileRoutes')
const statsRoutes = require('./routes/statsRoutes')
const aiRoutes = require('./routes/aiRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/applications', applicationRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api', aiRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ error: 'Validation failed', details })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_tracker'

async function start() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()