const express = require('express')
const {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController')

const router = express.Router()

router.get('/', listApplications)
router.get('/:id', getApplication)
router.post('/', createApplication)
router.put('/:id', updateApplication)
router.delete('/:id', deleteApplication)

module.exports = router