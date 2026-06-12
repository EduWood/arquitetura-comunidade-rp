import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Comunidade RP - Plataforma de Cursos Online',
  description: 'Aprenda roleplay, produção e criação de conteúdo com os melhores instrutores',
  keywords: 'cursos online, roleplay, produção de vídeo, comunidade',
  authors: [{ name: 'Comunidade RP' }],
  openGraph: {
    title: 'Comunidade RP - Plataforma de Cursos',
    description: 'Aprenda com os melhores instrutores da comunidade',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
