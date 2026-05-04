import { Router } from 'express'
import * as ingestionController from '../controllers/ingestionController'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.get('/candidates', requireAdmin, ingestionController.listCandidates)
router.patch('/candidates/:id/approve', requireAdmin, ingestionController.approveCandidate)
router.patch('/candidates/:id/reject', requireAdmin, ingestionController.rejectCandidate)
router.patch('/candidates/:id/duplicate', requireAdmin, ingestionController.duplicateCandidate)

export default router
