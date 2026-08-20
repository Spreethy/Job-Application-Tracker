const Application = require('../models/Application')
const Profile = require('../models/Profile')
const { getProvider } = require('../ai/provider')

const getProfileData = async () => {
  let profile = await Profile.findOne()
  if (!profile) profile = await Profile.create({})
  return profile
}

const analyzeApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    if (!application.jobDescription) {
      return res
        .status(400)
        .json({ error: 'Add a job description to this application before running AI analysis' })
    }

    const profile = await getProfileData()
    const provider = await getProvider()
    const result = await provider.analyzeFit(application.jobDescription, profile)

    application.fitScore = result.fitScore
    application.missingSkills = result.missingSkills
    application.fitAnalysis = result.fitAnalysis
    await application.save()

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

const generateInterviewPrep = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    if (!application.jobDescription) {
      return res
        .status(400)
        .json({ error: 'Add a job description to this application before generating interview prep' })
    }

    const profile = await getProfileData()
    const provider = await getProvider()
    const result = await provider.generateInterviewPrep(application.jobDescription, profile)

    application.interviewPrep = result.questions
    await application.save()

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

const answerQuestion = async (req, res, next) => {
  try {
    const { message } = req.body || {}
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    const applications = await Application.find().sort({ appliedDate: -1 }).limit(50)
    const profile = await getProfileData()

    const dataContext = JSON.stringify(
      {
        totalApplications: applications.length,
        applications: applications.map((a) => ({
          company: a.company,
          role: a.role,
          status: a.status,
          appliedDate: a.appliedDate,
          nextActionDate: a.nextActionDate,
        })),
        profile: {
          name: profile.name,
          title: profile.title,
          skills: profile.skills,
        },
      },
      null,
      2
    )

    const provider = await getProvider()
    const result = await provider.answerQuestion(message, dataContext)

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

module.exports = { analyzeApplication, generateInterviewPrep, answerQuestion }