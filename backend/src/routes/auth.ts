import { Router } from 'express'
import * as authController from '../controllers/authController'

const router = Router()

router.get('/status', authController.status)
router.post('/setup-password', authController.setupPassword)
router.post('/login', authController.login)
router.post('/google', authController.loginGoogle)
router.get('/me', authController.me)

export default router
