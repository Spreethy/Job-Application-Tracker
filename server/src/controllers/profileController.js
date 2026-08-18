const Profile = require('../models/Profile')

const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne()
    if (!profile) {
      profile = await Profile.create({})
    }
    res.json({ data: profile })
  } catch (err) {
    next(err)
  }
}

const upsertProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne()
    if (!profile) {
      profile = await Profile.create(req.body)
    } else {
      Object.assign(profile, req.body)
      await profile.save()
    }
    res.json({ data: profile })
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, upsertProfile }