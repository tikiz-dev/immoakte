'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClipboardCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const onPricing = pathname === '/pricing'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <span className="text-base font-bold tracking-tight">Protokoll-Pro</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/pricing"
            className={`hidden sm:block px-3 py-2 rounded-md text-sm font-medium transition-colors ${onPricing ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Preise
          </Link>
          {user ? (
            <Link href="/dashboard" className="ml-1">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Anmelden</Button>
              </Link>
              <Link href="/login?mode=signup">
                <Button size="sm">Registrieren</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
