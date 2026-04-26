'use client'

/**
 * AuthContext (slim version).
 *
 * Die App hat kein Login mehr — alles läuft lokal im Browser. Damit aber
 * bestehende Komponenten, die `useAuth()` aufrufen, weiterhin compilen
 * und sinnvolle Werte bekommen, exposen wir hier eine schmale Fassade,
 * die einen synthetischen Lokal-User aus `localStorage` liefert.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateUser, wipeAllData, type LocalUser } from '@/lib/local-store'

interface AuthContextType {
  user: LocalUser | null
  isAdmin: boolean
  loading: boolean
  /** Setzt alle Browser-Daten zurück (vorher: Account-Löschung). */
  resetLocalData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Erst nach Hydration den User aus localStorage holen — sonst bekommen
    // SSR und Client unterschiedliche IDs und React beschwert sich.
    setUser(getOrCreateUser())
    setLoading(false)
  }, [])

  const resetLocalData = () => {
    wipeAllData()
    setUser(getOrCreateUser())
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin: false, loading, resetLocalData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
