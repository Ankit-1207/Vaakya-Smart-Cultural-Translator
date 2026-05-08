'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen flex-center">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-gradient" style={{ fontSize: '2rem' }}>Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="glass-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          <button type="submit" className="glass-button mt-4" disabled={loading} suppressHydrationWarning>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-4 text-muted text-sm">
          Don't have an account? <Link href="/register" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
