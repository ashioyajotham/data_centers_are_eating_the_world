import { Router } from 'express'
import * as authController from '../controllers/authController'

const router = Router()

router.post('/login', authController.login)
router.get('/me', authController.me)

export default router
