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
    const questions = [
      `Can you walk me through a project where you used ${terms[0] || 'your main stack'}?`,
      'How do you approach learning a new technology quickly?',
      `Describe a challenge you solved while building a ${terms[1] || 'full-stack'} feature.`,
      'How do you prioritize and plan your work when handling multiple tasks?',
      'Why are you interested in this role and what makes you a good fit?',
    ]
    return { questions }
  }

  async answerQuestion(question, dataContext) {
    const lower = (question || '').toLowerCase()
    const answers = []

    const countPatterns = [
      { re: /how many (.*)\?/, label: (m) => `Count of ${m[1]}` },
    ]

    const matches = lower.match(/how many ([a-z ]+)\?/)
    if (matches) {
      const target = matches[1]
      if (target.includes('interview')) {
        answers.push('Based on the data, count applications currently in the interview stage.')
      } else if (target.includes('offer')) {
        answers.push('Based on the data, count applications that reached an offer.')
      } else if (target.includes('applied') || target.includes('application')) {
        answers.push('The total number of applications in your tracker.')
      }
    }

    if (lower.includes('upcoming') || lower.includes('next')) {
      answers.push('Applications with an upcoming action date, sorted by that date.')
    }

    const summary = `Here is what I can tell from your tracker: ${dataContext.slice(0, 500)}`
    const answer = answers.length > 0 ? answers.join(' ') : summary

    return { answer }
  }
}

module.exports = MockProvider