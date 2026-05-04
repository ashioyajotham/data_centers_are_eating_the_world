import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as ingestionController from '../controllers/ingestionController'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

const publicSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/suggest', publicSuggestLimiter, ingestionController.suggestPublic)

router.get('/candidates', requireAdmin, ingestionController.listCandidates)
router.patch('/candidates/:id/approve', requireAdmin, ingestionController.approveCandidate)
router.patch('/candidates/:id/reject', requireAdmin, ingestionController.rejectCandidate)
router.patch('/candidates/:id/duplicate', requireAdmin, ingestionController.duplicateCandidate)

export default router
