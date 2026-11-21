import {useState} from 'react'

interface Source {
  chunk_id: number
  chunk_index: number
  similarity: number
}

interface Props {
  documentId: number
}

export default function AskDocument({documentId}: Props) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState('')

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setAnswer('')
    setSources([])

    try {
      const response = await fetch(
        `/api/documents/${documentId}/ask?q=${encodeURIComponent(question)}`,
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail)

      setAnswer(data.answer)
      setSources(data.sources)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Question failed')
    }
  }

  return (
    <section>
      <h2>Ask your document</h2>

      <form onSubmit={ask}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Enter your question"
          required
        />
        <button type="submit">Ask</button>
      </form>

      {error && <p>{error}</p>}

      {answer && (
        <section>
          <h3>Answer</h3>
          <p>{answer}</p>

          <h3>Sources</h3>
          {sources.map((source) => (
            <p key={source.chunk_id}>
              Chunk {source.chunk_index + 1} —{' '}
              {(source.similarity * 100).toFixed(1)}% similarity
            </p>
          ))}
        </section>
      )}
    </section>
  )
}