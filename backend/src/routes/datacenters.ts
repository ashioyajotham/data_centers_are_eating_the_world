import { Router } from 'express'
import * as dataCenterController from '../controllers/dataCenterController'
import { requireAdmin } from '../middleware/requireAdmin'
import { optionalAdmin } from '../middleware/optionalAdmin'

const router = Router()

router.get('/', optionalAdmin, dataCenterController.getAllDataCenters)
router.get('/geojson', optionalAdmin, dataCenterController.getGeoJSON)
router.get('/export/:format', optionalAdmin, dataCenterController.exportData)
router.patch(
  '/:id/sources/verify',
  requireAdmin,
  dataCenterController.verifyDataCenterSources
)
router.get('/:id', optionalAdmin, dataCenterController.getDataCenterById)
router.post('/', requireAdmin, dataCenterController.createDataCenter)
router.put('/:id', requireAdmin, dataCenterController.updateDataCenter)
router.delete('/:id', requireAdmin, dataCenterController.deleteDataCenter)

export default router

