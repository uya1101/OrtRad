'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'ホーム', href: '/' },
    { name: '記事一覧', href: '/articles' },
    { name: '検索', href: '/search' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-background-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-text-primary">OrtRad</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/admin/dashboard">
              <Button variant="primary" size="sm">
                管理画面
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-text-secondary hover:text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-background-tertiary bg-background-secondary">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-text-secondary hover:text-accent hover:bg-background-tertiary rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/admin/dashboard"
              className="block px-3 py-2 text-accent hover:bg-background-tertiary rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              管理画面
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
