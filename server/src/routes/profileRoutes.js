const express = require('express')
const { getProfile, upsertProfile } = require('../controllers/profileController')

const router = express.Router()

router.get('/', getProfile)
router.put('/', upsertProfile)

module.exports = router