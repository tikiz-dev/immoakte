'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error }: { error: Error | null, errorInfo: ErrorInfo | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Ein unerwarteter Fehler ist aufgetreten</h2>
        <p className="text-slate-600 mb-8">
          Entschuldigung, da ist etwas schiefgelaufen. Lade die Seite neu —
          deine Daten bleiben im Browser-Cache erhalten.
        </p>
        {error?.message && (
          <p className="text-xs text-slate-500 mb-6 font-mono break-words">
            {error.message}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Button onClick={() => window.location.reload()} className="w-full" size="lg">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Seite neu laden
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundaryInner>
      {children}
    </ErrorBoundaryInner>
  )
}
