const Application = require('../models/Application')

const SORT_FIELDS = ['company', 'role', 'appliedDate', 'status', 'fitScore', 'createdAt']

const buildFilter = (query) => {
  const filter = {}
  if (query.status) filter.status = query.status
  if (query.company) filter.company = { $regex: query.company, $options: 'i' }
  if (query.role) filter.role = { $regex: query.role, $options: 'i' }
  if (query.upcoming === 'true') {
    filter.nextActionDate = { $gte: new Date() }
  }
  return filter
}

const buildSort = (query) => {
  const field = SORT_FIELDS.includes(query.sort) ? query.sort : 'appliedDate'
  const order = query.order === 'asc' ? 1 : -1
  return { [field]: order }
}

const listApplications = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query)
    const sort = buildSort(req.query)
    const applications = await Application.find(filter).sort(sort)
    res.json({ data: applications, total: applications.length })
  } catch (err) {
    next(err)
  }
}

const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })
    res.json({ data: application })
  } catch (err) {
    next(err)
  }
}

const createApplication = async (req, res, next) => {
  try {
    const application = await Application.create(req.body)
    res.status(201).json({ data: application })
  } catch (err) {
    next(err)
  }
}

const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    const { status, note, ...fields } = req.body

    if (status && status !== application.status) {
      application.history.push({
        status,
        note: note || '',
        changedAt: new Date(),
      })
    }

    Object.assign(application, fields)
    if (status) application.status = status

    await application.save()
    res.json({ data: application })
  } catch (err) {
    next(err)
  }
}

const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })
    res.json({ data: { id: req.params.id } })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
}