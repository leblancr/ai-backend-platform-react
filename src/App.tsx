import {useState} from 'react'
import DocumentUpload from './components/DocumentUpload'
import EmbedDocument from './components/EmbedDocument'
import AskDocument from './components/AskDocument'

interface DocumentInfo {
  id: number
  filename: string
  content_type: string
  created_at: string
}

function App() {
  const [document, setDocument] = useState<DocumentInfo | null>(null)
  const [embedded, setEmbedded] = useState(false)

  function handleUpload(uploaded: DocumentInfo) {
    setDocument(uploaded)
    setEmbedded(false)
  }

  return (
    <main>
      <h1>AI Document Platform</h1>

      <DocumentUpload onUploaded={handleUpload}/>

      {document && (
        <section>
          <h2>{document.filename}</h2>
          <p>Document ID: {document.id}</p>

          <EmbedDocument
            documentId={document.id}
            onComplete={() => setEmbedded(true)}
          />

          {embedded && <p>Document successfully embedded.</p>}
          {embedded && <AskDocument documentId={document.id}/>}
        </section>
      )}
    </main>
  )
}

export default App