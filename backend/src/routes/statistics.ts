import { Router } from 'express'
import * as statisticsController from '../controllers/statisticsController'

const router = Router()

router.get('/', statisticsController.getStatistics)

export default router

