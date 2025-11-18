import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notes - Personal Note-Taking App',
  description: 'Beautiful, fast, self-hosted note-taking',
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
