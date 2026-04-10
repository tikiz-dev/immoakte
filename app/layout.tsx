import type { Metadata } from 'next'
import '@fontsource-variable/geist'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Protokoll-Pro - Digitale Mietübergabe',
  description: 'Erstellen Sie professionelle Übergabeprotokolle in Minuten. Rechtssicher, digital und direkt auf dem Smartphone.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
