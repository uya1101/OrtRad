import Link from 'next/link'
import { Github, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-background-tertiary bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-text-secondary">
            <span className="text-text-primary font-semibold">OrtRad</span>
            <span className="mx-2">©</span>
            {new Date().getFullYear()}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/your-org/ortrad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </Link>
            <Link
              href="/about"
              className="text-text-secondary hover:text-accent transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">について</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
