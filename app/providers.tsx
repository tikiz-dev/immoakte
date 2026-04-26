'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { CookieBanner } from '@/components/consent/CookieBanner'
import { GoogleAnalyticsLoader } from '@/components/consent/GoogleAnalyticsLoader'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          {children}
          <CookieBanner />
          <GoogleAnalyticsLoader />
          <Toaster position="top-center" />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  )
}
