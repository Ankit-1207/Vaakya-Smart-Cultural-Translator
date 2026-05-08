'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="container min-h-screen flex-center">Loading...</div>;

  return (
    <div className="container min-h-screen" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem' }}>Dashboard</h2>
        <button 
          className="glass-button glass-button-secondary" 
          style={{ width: 'auto' }}
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/');
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Translate</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Enter text to detect cultural nuances, idioms, and get contextual translations.
          </p>
          <Link href="/translate" className="glass-button" style={{ display: 'block', textAlign: 'center' }}>
            Open Translator
          </Link>
        </div>

        <div className="glass-panel" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>History</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            View your past translations and identified idioms.
          </p>
          <Link href="/history" className="glass-button" style={{ display: 'block', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--accent)' }}>
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}
