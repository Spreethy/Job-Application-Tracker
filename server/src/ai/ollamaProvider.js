class OllamaProvider {
  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '')
    this.model = process.env.OLLAMA_MODEL || 'llama3.2'
    this.timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 60000)
  }

  async isAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
      return res.ok
    } catch {
      return false
    }
  }

  async _chat(systemPrompt, userPrompt) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(this.timeoutMs),
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}`)
    }

    const data = await res.json()
    return data.message?.content || ''
  }

  _extractJson(text) {
    const trimmed = text.trim()
    try {
      return JSON.parse(trimmed)
    } catch {
      const match = trimmed.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return JSON.parse(match[0])
        } catch {
          return null
        }
      }
      return null
    }
  }

  async analyzeFit(jobDescription, profile) {
    const system = [
      'You are a hiring-fit analyst. Return ONLY a JSON object with exactly these keys:',
      '"fitScore" (integer 0-100), "missingSkills" (array of strings), "fitAnalysis" (short paragraph).',
      'Do not include markdown or any text outside the JSON.',
    ].join(' ')

    const user = [
      `JOB DESCRIPTION:\n${jobDescription}`,
      `\n\nCANDIDATE PROFILE:\nName: ${profile.name}\nTitle: ${profile.title}\nSummary: ${profile.summary}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Experience: ${profile.experience}`,
    ].join('\n')

    const content = await this._chat(system, user)
    const parsed = this._extractJson(content)

    if (!parsed) {
      throw new Error('Could not parse AI response')
    }

    return {
      fitScore: Number(parsed.fitScore) || 0,
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      fitAnalysis: String(parsed.fitAnalysis || ''),
    }
  }

  async generateInterviewPrep(jobDescription, profile) {
    const system = [
      'You are an interview coach. Return ONLY a JSON object with a single key "questions"',
      'containing an array of exactly 5 objects, each with two string keys "question" and "answer".',
      'The answer should be a realistic, helpful model answer to that interview question.',
      'Do not include markdown or any text outside the JSON.',
    ].join(' ')

    const user = [
      `JOB DESCRIPTION:\n${jobDescription}`,
      `\n\nCANDIDATE PROFILE:\nTitle: ${profile.title}`,
      `Skills: ${profile.skills.join(', ')}`,
    ].join('\n')

    const content = await this._chat(system, user)
    const parsed = this._extractJson(content)

    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error('Could not parse AI response')
    }

    return {
      questions: parsed.questions
        .slice(0, 6)
        .map((q) => ({
          question: String(q?.question || q || ''),
          answer: String(q?.answer || ''),
        })),
    }
  }

  async answerQuestion(question, dataContext) {
    const system = [
      'You are an assistant that answers questions about the user\'s job applications.',
      'Use ONLY the provided data. Be concise. If the data does not answer the question, say so.',
    ].join(' ')

    const user = [
      `USER QUESTION:\n${question}`,
      `\n\nAVAILABLE DATA:\n${dataContext}`,
    ].join('\n')

    const content = await this._chat(system, user)
    return { answer: content.trim() }
  }
}

module.exports = OllamaProvider