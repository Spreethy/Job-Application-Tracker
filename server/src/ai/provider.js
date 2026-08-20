const MockProvider = require('./mockProvider')
const OllamaProvider = require('./ollamaProvider')

let cachedProvider = null
let cachedAt = 0
const CACHE_TTL_MS = 30 * 1000

async function getProvider() {
  const mode = (process.env.AI_PROVIDER || 'auto').toLowerCase()

  if (mode === 'ollama') return new OllamaProvider()
  if (mode === 'mock') return new MockProvider()

  if (cachedProvider && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedProvider
  }

  const ollama = new OllamaProvider()
  if (await ollama.isAvailable()) {
    cachedProvider = ollama
  } else {
    cachedProvider = new MockProvider()
  }
  cachedAt = Date.now()
  return cachedProvider
}

async function getProviderName() {
  const provider = await getProvider()
  return provider.constructor.name.replace('Provider', '').toLowerCase()
}

module.exports = { getProvider, getProviderName }