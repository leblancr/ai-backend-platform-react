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

  async function upload() {
    if (!file) return

    const data = new FormData()
    data.append('file', file)

    setStatus('Uploading...')

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
          // Keep the original response text
        }

        throw new Error(message)
      }

      const document: DocumentInfo = await response.json()
      onUploaded(document)
      setStatus('Upload successful')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <section>
      <h2>Upload a document</h2>

      <input
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <button onClick={upload} disabled={!file}>
        Upload
      </button>

      <p>{status}</p>
    </section>
  )
}