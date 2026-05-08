'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await api.get('/api/translate/history');
        setHistory(response.data);
      } catch (err: any) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <div className="container min-h-screen" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>&larr; Back to Dashboard</Link>
      </div>
      
      <h2 className="text-gradient mb-4" style={{ fontSize: '2.5rem' }}>Translation History</h2>
      
      {loading ? (
        <div className="text-center" style={{ marginTop: '3rem' }}>Loading history...</div>
      ) : error ? (
        <div style={{ color: 'var(--danger)' }}>{error}</div>
      ) : history.length === 0 ? (
        <div className="glass-panel text-center text-muted">
          No translations yet. <Link href="/translate" style={{ color: 'var(--primary)' }}>Try translating something!</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span className="text-muted text-sm block mb-2">Original</span>
                  <div style={{ fontWeight: 500 }}>{item.original_text}</div>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span className="text-muted text-sm block mb-2">Translation</span>
                  <div style={{ color: 'var(--foreground)' }}>{item.translated_text}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                {item.is_idiom && (
                  <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Idiom Detected</span>
                )}
                {item.tone && (
                  <span className="text-muted text-sm">Tone: <span style={{ color: 'var(--foreground)' }}>{item.tone}</span></span>
                )}
                <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
