import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PeerLens - Anonymous Peer Feedback',
  description: 'Get honest feedback from your colleagues to identify blind spots and grow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
