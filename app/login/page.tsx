'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { ClipboardCheck, Eye, EyeOff } from 'lucide-react'
import { useEffect, Suspense } from 'react'

function LoginForm() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  if (user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name)
        toast.success('Registrierung erfolgreich! Bitte prüfen Sie Ihr E-Mail-Postfach zur Verifizierung.', {
          duration: 10000,
        })
        setIsSignUp(false)
      } else {
        await signInWithEmail(email, password)
        toast.success('Anmeldung erfolgreich!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast.error(error.message || 'Ein Fehler ist bei der Google-Anmeldung aufgetreten.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <header className="flex items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">Protokoll-Pro</span>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isSignUp ? 'Registrieren' : 'Anmelden'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Erstellen Sie Ihr Konto' : 'Willkommen zurück bei Protokoll-Pro'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passwort</Label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => toast.info('Passwort-Reset per E-Mail wird bald verfügbar.')}>
                      Passwort vergessen?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Lädt...' : (isSignUp ? 'Registrieren' : 'Anmelden')}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-500">oder</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
              Mit Google anmelden
            </Button>

            <p className="mt-4 text-center text-sm">
              {isSignUp ? 'Bereits ein Konto?' : 'Noch kein Konto?'}
              <button
                className="ml-1 text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Anmelden' : 'Registrieren'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Lade...</div>}>
      <LoginForm />
    </Suspense>
  )
}
