const express = require('express')
const {
  analyzeApplication,
  generateInterviewPrep,
  answerQuestion,
} = require('../controllers/aiController')

const router = express.Router()

router.post('/applications/:id/analyze', analyzeApplication)
router.post('/applications/:id/interview-prep', generateInterviewPrep)
router.post('/assistant', answerQuestion)

module.exports = router