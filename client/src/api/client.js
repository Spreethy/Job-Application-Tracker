const BASE_URL = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const message = json?.error || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.details = json?.details
    throw error
  }

  return json
}

export const api = {
  getApplications: (params = '') => request(`/applications${params}`),
  getApplication: (id) => request(`/applications/${id}`),
  createApplication: (data) =>
    request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id, data) =>
    request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  analyzeApplication: (id) =>
    request(`/applications/${id}/analyze`, { method: 'POST' }),
  generateInterviewPrep: (id) =>
    request(`/applications/${id}/interview-prep`, { method: 'POST' }),
  getProfile: () => request('/profile'),
  updateProfile: (data) =>
    request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getStats: () => request('/stats'),
  askAssistant: (message) =>
    request('/assistant', { method: 'POST', body: JSON.stringify({ message }) }),
  parseResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
  },
  importFromUrl: (url) =>
    request('/import/url', { method: 'POST', body: JSON.stringify({ url }) }),
}