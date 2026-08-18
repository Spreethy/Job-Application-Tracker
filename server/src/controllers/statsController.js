const Application = require('../models/Application')

const getStats = async (req, res, next) => {
  try {
    const counts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const statusCounts = { applied: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 }
    counts.forEach((c) => {
      statusCounts[c._id] = c.count
    })

    const total = counts.reduce((sum, c) => sum + c.count, 0)

    const upcoming = await Application.find({ nextActionDate: { $gte: new Date() } })
      .sort({ nextActionDate: 1 })
      .limit(5)

    res.json({ statusCounts, total, upcoming })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats }