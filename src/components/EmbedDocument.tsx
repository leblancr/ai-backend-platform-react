interface Props {
  documentId: number
  onComplete: () => void
}

export default function EmbedDocument({documentId, onComplete}: Props) {
  async function embed() {
    try {
      const response = await fetch(`/api/documents/${documentId}/embed`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail)
      }

      onComplete()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Embedding failed')
    }
  }

  return <button onClick={embed}>Create embeddings</button>
}