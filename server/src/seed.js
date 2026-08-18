require('dotenv').config()
const mongoose = require('mongoose')
const Application = require('./models/Application')
const Profile = require('./models/Profile')

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_tracker'

const profile = {
  name: 'Preethy Srinevasan',
  title: 'Full-Stack Developer',
  summary:
    'Full-stack developer building web applications with React, Node.js, and MongoDB. Passionate about clean architecture and practical product features.',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Tailwind CSS', 'Git'],
  experience:
    'Built and deployed full-stack web applications. Currently focused on portfolio projects that solve real problems with modern tools.',
  education: 'Relevant coursework in web development and software engineering.',
}

const applications = [
  {
    company: 'Acme Corp',
    role: 'Frontend Engineer',
    location: 'Remote',
    status: 'interview',
    appliedDate: daysAgo(12),
    nextActionDate: daysFromNow(2),
    notes: 'Second round with hiring manager next week.',
    salaryRange: '$110k - $140k',
    jobUrl: 'https://acme.example.com/jobs/frontend',
    jobDescription:
      'We are looking for a Frontend Engineer with strong React and TypeScript skills to build our customer-facing dashboard. Experience with state management and testing is a plus.',
    history: [
      { status: 'applied', note: '', changedAt: daysAgo(12) },
      { status: 'interview', note: 'First round with recruiter', changedAt: daysAgo(3) },
    ],
  },
  {
    company: 'Globex',
    role: 'Backend Engineer',
    location: 'Hybrid - Berlin',
    status: 'applied',
    appliedDate: daysAgo(4),
    nextActionDate: null,
    notes: '',
    salaryRange: '$95k - $120k',
    jobUrl: 'https://globex.example.com/backend',
    jobDescription:
      'Backend Engineer to design scalable REST APIs with Node.js and MongoDB. Kubernetes experience preferred but not required.',
    history: [{ status: 'applied', note: '', changedAt: daysAgo(4) }],
  },
  {
    company: 'Initech',
    role: 'Full-Stack Developer',
    location: 'Austin, TX',
    status: 'offer',
    appliedDate: daysAgo(30),
    nextActionDate: daysFromNow(5),
    notes: 'Offer received, negotiating start date.',
    salaryRange: '$120k - $150k',
    jobUrl: 'https://initech.example.com/fullstack',
    jobDescription:
      'Join a small team building a SaaS platform. You will own features end-to-end using React, Node.js, and MongoDB.',
    history: [
      { status: 'applied', note: '', changedAt: daysAgo(30) },
      { status: 'interview', note: 'Technical interview passed', changedAt: daysAgo(15) },
      { status: 'offer', note: 'Received verbal offer', changedAt: daysAgo(6) },
    ],
  },
  {
    company: 'Umbrella Labs',
    role: 'Product Engineer',
    location: 'Remote',
    status: 'rejected',
    appliedDate: daysAgo(20),
    nextActionDate: null,
    notes: 'Position filled internally.',
    salaryRange: '',
    jobUrl: '',
    jobDescription: '',
    history: [
      { status: 'applied', note: '', changedAt: daysAgo(20) },
      { status: 'rejected', note: 'Position filled', changedAt: daysAgo(10) },
    ],
  },
  {
    company: 'Stark Industries',
    role: 'React Developer',
    location: 'New York, NY',
    status: 'interview',
    appliedDate: daysAgo(6),
    nextActionDate: daysFromNow(1),
    notes: 'Take-home assignment due Friday.',
    salaryRange: '$130k - $160k',
    jobUrl: 'https://stark.example.com/react',
    jobDescription:
      'React Developer for our design system team. Deep knowledge of React, CSS-in-JS, and accessibility required.',
    history: [
      { status: 'applied', note: '', changedAt: daysAgo(6) },
      { status: 'interview', note: 'Screening call completed', changedAt: daysAgo(2) },
    ],
  },
  {
    company: 'Wayne Enterprises',
    role: 'Node.js Developer',
    location: 'Remote',
    status: 'withdrawn',
    appliedDate: daysAgo(9),
    nextActionDate: null,
    notes: 'Withdrew after accepting other opportunity.',
    salaryRange: '',
    jobUrl: '',
    jobDescription: '',
    history: [
      { status: 'applied', note: '', changedAt: daysAgo(9) },
      { status: 'withdrawn', note: 'Accepted elsewhere', changedAt: daysAgo(2) },
    ],
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected. Clearing collections...')

  await Promise.all([Application.deleteMany({}), Profile.deleteMany({})])
  await Profile.create(profile)
  await Application.insertMany(applications)

  const count = await Application.countDocuments()
  console.log(`Seeded profile and ${count} applications.`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})