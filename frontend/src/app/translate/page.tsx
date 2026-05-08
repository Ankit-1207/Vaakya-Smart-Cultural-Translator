'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function Translate() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/translate/', {
        text,
        target_language: targetLanguage
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>&larr; Back to Dashboard</Link>
      </div>
      
      <h2 className="text-gradient mb-4" style={{ fontSize: '2.5rem' }}>Cultural Translator</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px' }}>
          <form onSubmit={handleTranslate}>
            <div className="form-group">
              <label className="form-label">Text to translate</label>
              <textarea 
                className="glass-input" 
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a phrase or idiom..."
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Language</label>
              <select 
                className="glass-input"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                style={{ appearance: 'none', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                suppressHydrationWarning
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="te">Telugu</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            
            <button type="submit" className="glass-button" disabled={loading} suppressHydrationWarning>
              {loading ? 'Translating...' : 'Translate'}
            </button>
            {error && <div style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</div>}
          </form>
        </div>

        <div className="glass-panel" style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Result</h3>
          
          {!result && !loading && (
            <div className="text-muted text-center" style={{ marginTop: '3rem' }}>
              Your translation will appear here.
            </div>
          )}
          
          {loading && (
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {result && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label text-sm">Translation</label>
                <div style={{ fontSize: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {result.translated_text}
                </div>
              </div>
              
              {result.is_idiom && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.875rem' }}>✓ Idiom Detected</span>
                </div>
              )}
              
              {result.meaning && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label text-sm text-muted">Meaning</label>
                  <p>{result.meaning}</p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                {result.tone && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem' }}>
                    <span className="text-muted">Tone:</span> {result.tone}
                  </div>
                )}
                {result.formality && (
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem' }}>
                    <span className="text-muted">Formality:</span> {result.formality}
                  </div>
                )}
              </div>
              
              {result.used_when && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label className="form-label text-sm text-muted">When to use</label>
                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>"{result.used_when}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
