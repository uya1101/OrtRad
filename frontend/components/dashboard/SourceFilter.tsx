import { Button } from '@/components/ui/Button'

type SourceType = 'all' | 'rss' | 'pubmed'

interface SourceFilterProps {
  activeSource: SourceType
  onSourceChange: (source: SourceType) => void
}

export function SourceFilter({ activeSource, onSourceChange }: SourceFilterProps) {
  const sources: { value: SourceType; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'rss', label: 'RSS' },
    { value: 'pubmed', label: 'PubMed' },
  ]

  return (
    <div className="flex items-center gap-2">
      {sources.map((source) => (
        <Button
          key={source.value}
          variant={activeSource === source.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onSourceChange(source.value)}
        >
          {source.label}
        </Button>
      ))}
    </div>
  )
}
