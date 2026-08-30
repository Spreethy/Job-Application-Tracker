const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'with', 'in', 'on', 'at',
  'we', 'you', 'your', 'our', 'is', 'are', 'be', 'as', 'by', 'will', 'should',
  'must', 'have', 'has', 'had', 'can', 'could', 'may', 'from', 'this', 'that',
  'these', 'those', 'it', 'its', 'not', 'no', 'so', 'if', 'then', 'than', 'but',
  'experience', 'experience.', 'skills', 'role', 'team', 'work', 'working',
  'ability', 'strong', 'knowledge', 'including', 'preferred', 'required',
  'requirements', 'looking', 'someone', 'who', 'what', 'new', 'using', 'use',
  'etc', 'plus', 'join', 'well', 'good', 'best', 'would', 'able',
])

const TERMS = [
  'react', 'node', 'node.js', 'typescript', 'javascript', 'mongodb', 'express',
  'rest', 'api', 'graphql', 'sql', 'postgresql', 'mysql', 'tailwind', 'css',
  'html', 'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'git', 'testing',
  'jest', 'cypress', 'playwright', 'redux', 'next.js', 'vue', 'angular', 'python',
  'java', 'go', 'golang', 'ruby', 'php', 'c#', 'c++', 'rust', 'scala', 'kotlin',
  'swift', 'django', 'flask', 'spring', 'fastapi', 'sass', 'less', 'webpack',
  'vite', 'babel', 'ci/cd', 'jenkins', 'terraform', 'linux', 'redis', 'kafka',
  'microservices', 'serverless', 'auth', 'oauth', 'jwt', 'graphql', 'websockets',
  'agile', 'scrum', 'leadership', 'communication', 'problem-solving', 'design',
  'architecture', 'devops', 'full-stack', 'frontend', 'backend', 'cloud',
  'machine learning', 'ai', 'data', 'analytics', 'security', 'accessibility',
]

function extractTerms(text) {
  const lower = (text || '').toLowerCase()
  const found = new Set()
  for (const term of TERMS) {
    if (lower.includes(term)) found.add(term)
  }
  for (const word of lower.split(/[^a-z0-9+#.]+/)) {
    if (word.length > 2 && !STOPWORDS.has(word) && !found.has(word)) {
      found.add(word)
    }
  }
  return [...found]
}

const TOPIC_WORDS = {
  interview: ['interview', 'interviews', 'interviewing'],
  offer: ['offer', 'offers', 'offered'],
  rejected: ['reject', 'rejects', 'rejected', 'rejection', 'rejections'],
  applied: ['applied', 'apply', 'applying', 'submitted'],
  application: ['application', 'applications', 'apps'],
  withdrawn: ['withdrawn', 'withdrew'],
}

const TOPIC_STATUS = {
  interview: 'interview',
  offer: 'offer',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
  applied: 'applied',
}

function editDistance(a, b) {
  const m = a.length
  const n = b.length
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const curr = [i]
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = curr
  }
  return prev[n]
}

function detectTopics(text) {
  const topics = new Set()
  if (/\b(question|questions|prep|preparation|practice)\b/.test(text)) {
    topics.add('questions')
  }
  for (const raw of text.split(/[^a-z0-9+#]+/)) {
    for (const [topic, words] of Object.entries(TOPIC_WORDS)) {
      for (const word of words) {
        if (raw === word || editDistance(raw, word) <= (word.length >= 8 ? 2 : 1)) {
          topics.add(topic)
        }
      }
    }
  }
  return [...topics]
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function listApps(apps) {
  return apps.map((a) => `${a.role} at ${a.company}`).join(', ')
}

function describeCounts(apps, totalApplications, topics) {
  const parts = []
  for (const topic of topics) {
    const status = TOPIC_STATUS[topic]
    if (!status) continue
    const matches = apps.filter((a) => a.status === status)
    if (matches.length === 0) {
      parts.push(`You have no applications in the ${status} stage.`)
    } else {
      parts.push(
        `You have ${matches.length} application${matches.length === 1 ? '' : 's'} in the ${status} stage: ${listApps(matches)}.`
      )
    }
  }
  if (topics.includes('application')) {
    parts.push(`In total you have ${totalApplications} application${totalApplications === 1 ? '' : 's'} in your tracker.`)
  }
  return parts.join(' ')
}

function describeUpcoming(apps) {
  const upcoming = apps
    .filter((a) => a.nextActionDate)
    .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))
  if (upcoming.length === 0) {
    return 'You have no upcoming action dates set on any application.'
  }
  const lines = upcoming
    .slice(0, 5)
    .map((a) => `${formatDate(a.nextActionDate)} — ${a.role} at ${a.company}`)
  return `You have ${upcoming.length} upcoming action${upcoming.length === 1 ? '' : 's'}:\n${lines.join('\n')}`
}

function interviewPractice(apps) {
  const interviewing = apps.filter((a) => a.status === 'interview')
  if (interviewing.length === 0) {
    return 'None of your applications are in the interview stage right now. Move one to "interview" and ask me again.'
  }
  const intro = `You have interviews with ${listApps(interviewing)}. Here are some questions to practice:`
  const questions = [
    `Walk me through a project that best shows the skills needed for this role.`,
    'Tell me about a technical challenge you faced and how you solved it.',
    'How do you prioritize when working on multiple features at once?',
    'Give an example of feedback you received and how you acted on it.',
    `Why do you want to work here, and what would you bring in your first 90 days?`,
  ]
  return `${intro}\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
}

function summarizeContext(dataContext) {
  let data
  try {
    data = JSON.parse(dataContext)
  } catch {
    return `Here is what I can tell from your tracker: ${dataContext.slice(0, 500)}`
  }

  const lines = [
    `You have ${data.totalApplications} application${data.totalApplications === 1 ? '' : 's'} in your tracker.`,
  ]

  const byStatus = {}
  for (const app of data.applications || []) {
    byStatus[app.status] = (byStatus[app.status] || 0) + 1
  }
  const breakdown = Object.entries(byStatus)
    .map(([status, n]) => `${n} ${status}`)
    .join(', ')
  if (breakdown) lines.push(`Status breakdown: ${breakdown}.`)

  const upcoming = (data.applications || [])
    .filter((a) => a.nextActionDate)
    .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))[0]
  if (upcoming) {
    const date = new Date(upcoming.nextActionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    lines.push(`Next up: ${upcoming.role} at ${upcoming.company} on ${date}.`)
  }

  return lines.join(' ')
}

class MockProvider {
  async isAvailable() {
    return true
  }

  async analyzeFit(jobDescription, profile) {
    const profileTerms = new Set(extractTerms(profile.skills.join(' ') + ' ' + (profile.summary || '')))
    const jobTerms = extractTerms(jobDescription)

    let matches = 0
    const missing = []
    for (const term of jobTerms) {
      if (profileTerms.has(term)) matches++
      else missing.push(term)
    }

    const total = jobTerms.length || 1
    const fitScore = Math.round((matches / total) * 100)
    const cappedMissing = missing.slice(0, 8)

    const analysis =
      `Matched ${matches} of ${total} key terms from the job description against your profile. ` +
      (missing.length > 0
        ? `Consider highlighting or learning: ${missing.slice(0, 5).join(', ')}.`
        : 'Your profile covers the key requirements well.')

    return { fitScore, missingSkills: cappedMissing, fitAnalysis: analysis }
  }

  async generateInterviewPrep(jobDescription, profile) {
    const terms = extractTerms(jobDescription).slice(0, 4)
    const [t1, t2, t3, t4] = [
      terms[0] || 'your main stack',
      terms[1] || 'full-stack',
      terms[2] || 'larger',
      terms[3] || 'your team',
    ]
    const questions = [
      {
        question: `Can you walk me through a project where you used ${t1}?`,
        answer:
          `I would describe a project end to end using the STAR method: the situation, the task, ` +
          `the action, and the result. I'd focus specifically on ${t1}, explain why I chose it, ` +
          `the trade-offs I considered, and quantify the outcome (e.g. performance, users, or time saved).`,
      },
      {
        question: 'How do you approach learning a new technology quickly?',
        answer:
          'I start with the official docs and a small proof-of-concept, then build a tiny real-world ' +
          'feature with it. I encode what I learn (notes or a short demo), review the common gotchas, ' +
          'and validate my understanding by explaining it to a teammate or writing a short summary.',
      },
      {
        question: `Describe a challenge you solved while building a ${t2} feature.`,
        answer:
          `I'd pick a concrete challenge I hit while building a ${t2} feature — for example an ` +
          `integration bug, a performance bottleneck, or a tricky requirement. I'd walk through how I ` +
          `isolated the root cause, the options I evaluated, what I chose and why, and the measurable ` +
          `outcome. I'd connect it to the skills this role needs.`,
      },
      {
        question: 'How do you prioritize and plan your work when handling multiple tasks?',
        answer:
          'I write down all open tasks and rank them by impact and deadline. I break larger items into ' +
          'smaller, shippable steps, use a short planning cadence (daily or weekly), and communicate ' +
          'trade-offs early if scope shifts. I always keep one clearly defined top priority so progress ' +
          'stays visible.',
      },
      {
        question: 'Why are you interested in this role and what makes you a good fit?',
        answer:
          `Based on my profile, this role aligns with my background in ${t3} work and my strengths in ` +
          `${t4}. I'd connect my most relevant experience and skills to the job description, mention ` +
          `specific examples, and express genuine interest in the product and team.`,
      },
    ]
    return { questions }
  }

  async answerQuestion(question, dataContext) {
    const lower = (question || '').toLowerCase()

    if (/^\s*(hi+|hello+|hey+|yo|howdy|good\s+(morning|afternoon|evening))\b/.test(lower)) {
      return {
        answer:
          "Hi! I'm your job tracker assistant. Try asking things like " +
          '"How many interviews do I have?", "How many applications have I sent?" ' +
          'or "What are my upcoming actions?"',
      }
    }

    let data = null
    try {
      data = JSON.parse(dataContext)
    } catch {
      data = null
    }
    const apps = (data && data.applications) || []
    const totalApplications = data ? data.totalApplications : apps.length

    const topics = detectTopics(lower)

    if (topics.includes('questions')) {
      return { answer: interviewPractice(apps) }
    }

    if (/compan/.test(lower) && (topics.includes('applied') || topics.includes('application'))) {
      const companies = [...new Set(apps.map((a) => a.company).filter(Boolean))]
      return {
        answer:
          companies.length > 0
            ? `You have applied to ${companies.length} compan${companies.length === 1 ? 'y' : 'ies'}: ${companies.join(', ')}.`
            : 'You have no applications yet.',
      }
    }

    const countTopics = topics.filter((t) => TOPIC_STATUS[t] || t === 'application')
    if (countTopics.length > 0) {
      return { answer: describeCounts(apps, totalApplications, countTopics) }
    }

    if (/upcoming|next|deadline/.test(lower)) {
      return { answer: describeUpcoming(apps) }
    }

    if (topics.length === 0 && /company|companies/.test(lower)) {
      const companies = [...new Set(apps.map((a) => a.company).filter(Boolean))]
      return {
        answer:
          companies.length > 0
            ? `You have applied to: ${companies.join(', ')}.`
            : 'You have no applications yet.',
      }
    }

    return { answer: summarizeContext(dataContext) }
  }
}

module.exports = MockProvider