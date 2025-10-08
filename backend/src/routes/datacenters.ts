import { Router } from 'express'
import * as dataCenterController from '../controllers/dataCenterController'

const router = Router()

router.get('/', dataCenterController.getAllDataCenters)
router.get('/geojson', dataCenterController.getGeoJSON)
router.get('/export/:format', dataCenterController.exportData)
router.get('/:id', dataCenterController.getDataCenterById)
router.post('/', dataCenterController.createDataCenter)
router.put('/:id', dataCenterController.updateDataCenter)
router.delete('/:id', dataCenterController.deleteDataCenter)

export default router

