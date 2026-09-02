import { useState } from 'react'
import { api } from '../api/client'

export function ResumeUpload({ onParseComplete, onClose }) {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf' || 
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(droppedFile)
      } else {
        setError('Only PDF and DOCX files are allowed')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Only PDF and DOCX files are allowed')
        e.target.value = ''
      }
    }
  }

  const handleParse = async () => {
    if (!file) return
    
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const data = await api.parseResume(file)
      setResult(data)
      if (onParseComplete) {
        onParseComplete(data)
      }
    } catch (err) {
      setError(err.message || 'Failed to parse resume')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseResult = () => {
    if (result && onParseComplete) {
      onParseComplete(result)
    }
    if (onClose) onClose()
  }

  if (!onClose && !result) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center"
           onDragEnter={handleDrag}
           onDragLeave={handleDrag}
           onDragOver={handleDrag}
           onDrop={handleDrop}
           className={dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}>
        <input type="file"
               id="resume-upload"
               accept=".pdf,.docx"
               onChange={handleFileChange}
               className="hidden" />
        <label htmlFor="resume-upload" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-gray-600">Drag & drop your resume (PDF or DOCX)</p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </label>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </div>
    )
  }

  if (result) {
    return (
      <div className="border border-green-300 bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2">Resume Parsed Successfully</h3>
        <div className="space-y-2 text-sm">
          <p><strong>File:</strong> {result.fileName}</p>
          <p><strong>Name:</strong> {result.parsed.name || 'Not detected'}</p>
          <p><strong>Skills found:</strong> {result.parsed.skills.length > 0 ? result.parsed.skills.join(', ') : 'None detected'}</p>
          <p><strong>Experience:</strong> {result.parsed.experience || 'Not detected'}</p>
          <p><strong>Education:</strong> {result.parsed.education || 'Not detected'}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleUseResult}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Use This Data
          </button>
          <button onClick={() => { setFile(null); setResult(null); setError(null); }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Upload Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center"
         onDragEnter={handleDrag}
         onDragLeave={handleDrag}
         onDragOver={handleDrag}
         onDrop={handleDrop}
         className={dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}>
      <input type="file"
             id="resume-upload"
             accept=".pdf,.docx"
             onChange={handleFileChange}
             className="hidden" />
      <label htmlFor="resume-upload" className="cursor-pointer">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-gray-600">Drag & drop your resume (PDF or DOCX)</p>
        <p className="text-sm text-gray-500">or click to browse</p>
      </label>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      {file && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Selected: {file.name}</p>
          <button onClick={handleParse}
                  disabled={isLoading}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Parsing...' : 'Parse Resume'}
          </button>
        </div>
      )}
    </div>
  )
}