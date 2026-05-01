import { Router } from 'express'
import * as dataCenterController from '../controllers/dataCenterController'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.get('/', dataCenterController.getAllDataCenters)
router.get('/geojson', dataCenterController.getGeoJSON)
router.get('/export/:format', dataCenterController.exportData)
router.patch(
  '/:id/sources/verify',
  requireAdmin,
  dataCenterController.verifyDataCenterSources
)
router.get('/:id', dataCenterController.getDataCenterById)
router.post('/', requireAdmin, dataCenterController.createDataCenter)
router.put('/:id', requireAdmin, dataCenterController.updateDataCenter)
router.delete('/:id', requireAdmin, dataCenterController.deleteDataCenter)

export default router

