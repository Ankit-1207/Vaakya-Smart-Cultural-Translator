import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vaakya - Cultural Translation System',
  description: 'AI-powered cultural translation and idiom detection platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', borderRadius: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Vaakya</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/login" className="glass-button glass-button-secondary" style={{ padding: '0.5rem 1rem' }}>Login</a>
            <a href="/register" className="glass-button" style={{ padding: '0.5rem 1rem' }}>Get Started</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
