import { useState } from 'react'

export type CollectionSource = 'rss' | 'pubmed'

export function useCollection() {
  const [loading, setLoading] = useState<CollectionSource | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function triggerCollection(source: CollectionSource) {
    setLoading(source)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/collect/${source}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Collection failed')
      }

      const data = await response.json()
      setSuccess(
        `${source.toUpperCase()} collection completed: ${data.count || 0} articles collected`
      )
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(null)
    }
  }

  return { triggerCollection, loading, error, success, clearMessages: () => { setError(null); setSuccess(null) } }
}
