import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getSseManager } from '../events/index.js'

const router = Router()

router.get('/stream', requireAuth(), (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  res.write(
    `data: ${JSON.stringify({ type: 'connected' })}\n\n`
  )

  const sseManager = getSseManager()
  sseManager.addClient(req.user.id, res)

  req.on('close', () => {
    sseManager.removeClient(req.user.id, res)
  })
})

export default router
