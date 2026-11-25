import './App.css'
import {useEffect, useState} from 'react'
import DocumentUpload from './components/DocumentUpload'
import EmbedDocument from './components/EmbedDocument'
import AskDocument from './components/AskDocument'

interface DocumentInfo {
  id: number
  filename: string
  content_type: string
  created_at: string
  total_chunks?: number
  embedded_chunks?: number
  embedded?: boolean
}

async function fetchDocuments(): Promise<DocumentInfo[]> {
  const response = await fetch('/api/documents/')

  if (!response.ok) {
    throw new Error('Could not load documents')
  }

  return response.json()
}

function App() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [document, setDocument] = useState<DocumentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDocuments()
      .then((loaded) => {
        setDocuments(loaded)
        if (loaded.length > 0) {
          setDocument(loaded[loaded.length - 1])
        }
      })
      .catch(() => setError('Could not load documents'))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(uploaded: DocumentInfo) {
    try {
      const loaded = await fetchDocuments()
      setDocuments(loaded)

      const newDocument = loaded.find((item) => item.id === uploaded.id)
      setDocument(newDocument ?? uploaded)
      setError('')
    } catch {
      setDocument(uploaded)
      setError('Document uploaded, but could not refresh the document list')
    }
  }

  async function handleDelete(item: DocumentInfo) {
    if (!window.confirm(`Delete ${item.filename}?`)) return

    try {
      const response = await fetch(`/api/documents/${item.id}`, {method: 'DELETE'})
      if (!response.ok) throw new Error('Delete failed')

      setDocuments((current) => current.filter((d) => d.id !== item.id))
      setDocument((current) => (current?.id === item.id ? null : current))
      setError('')
    } catch {
      setError('Could not delete the document')
    }
  }

  function handleEmbedded() {
    if (!document) return

    const updated = {...document, embedded: true}
    setDocument(updated)
    setDocuments((current) =>
      current.map((item) => item.id === updated.id ? updated : item)
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark">AI</div>
        <div>
          <h1>AI Document Platform</h1>
          <p>Upload documents, search their contents, and get AI-powered answers.</p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="workspace">
        <aside className="sidebar">
          <section className="panel documents-panel">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Your documents</h2>
                <p>{documents.length} document{documents.length === 1 ? '' : 's'} in your collection</p>
              </div>
            </div>

            {loading && <p className="muted-message">Loading documents...</p>}

            {!loading && documents.length === 0 && (
              <p className="empty-message">No documents yet. Upload one to get started.</p>
            )}

            <div className="document-list">
              {documents.map((item) => (
                <div className="document-row" key={item.id}>
                <button
                  className={`document-item ${document?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setDocument(item)}
                  aria-pressed={document?.id === item.id}
                >
                  <span className="document-icon">DOC</span>
                  <span className="document-info">
                    <span className="document-name">{item.filename}</span>
                    <span className="document-id">Document #{item.id}</span>
                  </span>
                  <span className={`status ${item.embedded ? 'status-ready' : 'status-pending'}`}>
                    {item.embedded ? 'Ready' : 'Pending'}
                  </span>
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(item)}
                  aria-label={`Delete ${item.filename}`}
                >
                  ×
                </button>
                </div>
              ))}
            </div>
          </section>
          <section className="panel upload-panel">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>Upload document</h2>
                <p>Add a document to your collection.</p>
              </div>
            </div>

            <DocumentUpload onUploaded={handleUpload}/>
          </section>

        </aside>

        <section className="panel main-panel">
          {document ? (
            <>
              <div className="selected-document">
                <div>
                  <span className="eyebrow">SELECTED DOCUMENT</span>
                  <h2>{document.filename}</h2>
                  <p>Document #{document.id}</p>
                </div>
                <span className={`status ${document.embedded ? 'status-ready' : 'status-pending'}`}>
                  {document.embedded ? 'Embedded' : 'Not embedded'}
                </span>
              </div>

              <div className="document-workspace">
                {document.embedded ? (
                  <AskDocument documentId={document.id}/>
                ) : (
                  <div className="embedding-section">
                    <h3>Prepare document for AI search</h3>
                    <p>
                      Create embeddings so the application can find relevant
                      passages when you ask a question.
                    </p>
                    <EmbedDocument
                      documentId={document.id}
                      onComplete={handleEmbedded}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="welcome-state">
              <div className="welcome-icon">AI</div>
              <h2>Your document workspace</h2>
              <p>Upload a document or select one from your collection to get started.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="app-footer">
        AI Document Platform <span>·</span> Document search powered by retrieval-augmented generation
      </footer>
    </main>
  )
}

export default App