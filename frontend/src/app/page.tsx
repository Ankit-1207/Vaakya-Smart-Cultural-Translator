import Link from 'next/link';

export default function Home() {
  return (
    <main className="container min-h-screen flex-center flex-col text-center" style={{ marginTop: '-4rem' }}>
      <div className="glass-panel" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
          Cultural Translation, <br /> Done Right.
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Vaakya goes beyond literal translation. We detect cultural nuances, idioms, and contextual meaning to provide truly accurate translations across languages.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/register" className="glass-button" style={{ width: 'auto', padding: '1rem 2rem' }}>
            Start Translating Now
          </Link>
          <Link href="/login" className="glass-button glass-button-secondary" style={{ width: 'auto', padding: '1rem 2rem' }}>
            I already have an account
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', maxWidth: '1000px' }}>
        {[
          { title: 'Idiom Detection', desc: 'Identify cultural phrases that literal translators miss.' },
          { title: 'Tone Analysis', desc: 'Understand the exact emotion and formality behind words.' },
          { title: 'AI-Powered', desc: 'Fallback to advanced LLMs for deep contextual understanding.' }
        ].map((feature, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: '2rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{feature.title}</h3>
            <p className="text-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
