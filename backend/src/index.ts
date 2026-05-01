import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dataCenterRoutes from './routes/datacenters'
import statisticsRoutes from './routes/statistics'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const frontendOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

// Middleware
app.use(
  cors({
    origin: frontendOrigins,
  })
)
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/datacenters', dataCenterRoutes)
app.use('/api/statistics', statisticsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api`)
})

export default app

