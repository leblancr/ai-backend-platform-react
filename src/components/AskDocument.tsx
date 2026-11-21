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
  const [loading, setLoading] = useState(false)

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setAnswer('')
    setSources([])
    setLoading(true)

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ask-section">
      <div className="section-heading">
        <span className="section-number">03</span>
        <div>
          <h2>Ask your document</h2>
          <p>Ask a question and get an answer based on its contents.</p>
        </div>
      </div>

      <form className="question-form" onSubmit={ask}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. How does the application authenticate users?"
          required
        />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Ask AI'}
        </button>
      </form>

      {loading && <p className="muted-message">Searching document passages and generating an answer...</p>}

      {error && <div className="error-message">{error}</div>}

      {answer && (
        <div className="answer-panel">
          <div className="answer-heading">
            <h3>Answer</h3>
            <span className="answer-label">AI RESPONSE</span>
          </div>

          <p className="answer-text">{answer}</p>

          <div className="sources-section">
            <h3>Retrieved sources</h3>
            <p className="source-description">
              Document passages used to generate this answer.
            </p>

            <div className="source-list">
              {sources.map((source) => (
                <div className="source-item" key={source.chunk_id}>
                  <span>Chunk ID: {source.chunk_id}</span>
                  <span>{(source.similarity * 100).toFixed(1)}% similarity</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}