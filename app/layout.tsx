import './globals.css'
import type { Metadata } from 'next'
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  variable: '--font-comfortaa'
})

export const metadata: Metadata = {
  title: 'Vanta - AI Outreach Automation',
  description: 'Personalized cold outreach at scale',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={comfortaa.variable}>
      <body>{children}</body>
    </html>
  )
}
