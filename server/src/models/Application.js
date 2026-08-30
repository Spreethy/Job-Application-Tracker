const mongoose = require('mongoose')

const STATUSES = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const applicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: '' },
    status: { type: String, enum: STATUSES, default: 'applied' },
    appliedDate: { type: Date, required: true },
    nextActionDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    salaryRange: { type: String, default: '' },
    jobUrl: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    fitScore: { type: Number, default: null, min: 0, max: 100 },
    missingSkills: { type: [String], default: [] },
    fitAnalysis: { type: String, default: '' },
    interviewPrep: {
      type: [
        {
          question: { type: String, default: '' },
          answer: { type: String, default: '' },
        },
      ],
      default: [],
      _id: false,
    },
    history: {
      type: [historyEntrySchema],
      default: function () {
        return [
          {
            status: this.status || 'applied',
            note: '',
            changedAt: this.appliedDate || new Date(),
          },
        ]
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        return ret
      },
    },
  }
)

module.exports = mongoose.model('Application', applicationSchema)
module.exports.STATUSES = STATUSES