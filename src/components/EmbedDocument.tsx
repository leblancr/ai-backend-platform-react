import {useState} from 'react'

interface Props {
  documentId: number
  onComplete: () => void
}

export default function EmbedDocument({documentId, onComplete}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function embed() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/documents/${documentId}/embed`, {
        method: 'POST',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.detail)
      }

      onComplete()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Embedding failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="embedding-action">
      <button className="primary-button" onClick={embed} disabled={loading}>
        {loading ? 'Creating embeddings...' : 'Create embeddings'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}