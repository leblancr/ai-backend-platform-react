import {useState} from 'react'

interface DocumentInfo {
  id: number
  filename: string
  content_type: string
  created_at: string
}

interface Props {
  onUploaded: (document: DocumentInfo) => void
}

export default function DocumentUpload({onUploaded}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)

  async function upload() {
    if (!file || uploading) return

    const data = new FormData()
    data.append('file', file)

    setStatus('Uploading document...')
    setUploading(true)

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: data,
      })

      if (!response.ok) {
        const body = await response.text()
        let message = `HTTP ${response.status}: ${body || response.statusText}`

        try {
          const parsed = JSON.parse(body)
          message = parsed.detail || message
        } catch {
          // Keep original response text
        }

        throw new Error(message)
      }

      const document: DocumentInfo = await response.json()
      onUploaded(document)
      setFile(null)
      setStatus('Upload successful')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-form">
      <label className="file-picker">
        <span>{file ? file.name : 'Choose a file'}</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setStatus('')
          }}
        />
      </label>

      <button
        className="primary-button"
        onClick={upload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload document'}
      </button>

      {status && (
        <p className={`upload-status ${status === 'Upload successful' ? 'success-text' : ''}`}>
          {status}
        </p>
      )}

      <p className="help-text">Supported formats: PDF, DOCX, TXT, MD</p>
    </div>
  )
}