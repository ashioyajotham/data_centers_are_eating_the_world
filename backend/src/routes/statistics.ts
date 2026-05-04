import { Router } from 'express'
import * as statisticsController from '../controllers/statisticsController'
import { optionalAdmin } from '../middleware/optionalAdmin'

const router = Router()

router.get('/', optionalAdmin, statisticsController.getStatistics)

export default router

