'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [isListening, setIsListening] = useState(false);
  const [enableSarcasm, setEnableSarcasm] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const targetLanguageRef = useRef(targetLanguage);

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
  }, [targetLanguage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();
    } catch (e) {
      console.error("Mic access denied for MediaRecorder", e);
      setSpeechError('Microphone permission denied.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = text ? text + (text.endsWith(' ') ? '' : ' ') : '';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          setText(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
          setText(finalTranscript + interimTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission denied.');
      } else {
        setSpeechError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (finalTranscript.trim()) {
            handleVoiceTranslate(finalTranscript, audioBlob);
          }
        };
        mediaRecorderRef.current.stop();
      } else if (finalTranscript.trim()) {
        handleVoiceTranslate(finalTranscript, null);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start error:", e);
      setSpeechError('Failed to start microphone.');
      setIsListening(false);
    }
  };

  const handleVoiceTranslate = async (spokenText: string, audioBlob: Blob | null) => {
    if (!spokenText.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const translationPromise = api.post('/api/voice-translate/', {
          text: spokenText,
          target_language: targetLanguageRef.current
        });
        
        let emotionChainPromise = null;
        if (audioBlob) {
          const formData = new FormData();
          formData.append('text', spokenText);
          formData.append('audio', audioBlob, 'audio.webm');
          
          emotionChainPromise = api.post('/api/detect-tone/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(emotionRes => {
             return api.post('/api/emotion-mismatch/', {
                text: spokenText,
                voice_emotion: emotionRes.data.detected_emotion
             }).then(mismatchRes => {
                return {
                    detected_emotion: emotionRes.data.detected_emotion,
                    confidence_score: emotionRes.data.confidence_score,
                    sentence_context: mismatchRes.data.sentence_context,
                    mismatch_detected: mismatchRes.data.mismatch_detected,
                    warning_message: mismatchRes.data.warning_message,
                    suggested_tone: mismatchRes.data.suggested_tone
                };
             });
          });
        }

        let sarcasmPromise = null;
        if (enableSarcasm) {
            sarcasmPromise = api.post('/api/detect-sarcasm/', { text: spokenText });
        }

        const [transRes, emotionData, sarcasmRes] = await Promise.all([
          translationPromise, 
          emotionChainPromise ? emotionChainPromise : Promise.resolve(null),
          sarcasmPromise ? sarcasmPromise : Promise.resolve(null)
        ]);
        
        setResult({
          translated_text: transRes.data.translated_text,
          tone: transRes.data.tone,
          meaning: transRes.data.cultural_meaning,
          used_when: transRes.data.usage_context,
          is_idiom: !!transRes.data.cultural_meaning,
          detected_emotion: emotionData?.detected_emotion,
          confidence_score: emotionData?.confidence_score,
          sentence_context: emotionData?.sentence_context,
          emotional_match_status: emotionData?.mismatch_detected ? 'mismatch' : 'match',
          warning_message: emotionData?.warning_message,
          suggested_tone: emotionData?.suggested_tone,
          sarcasm_detected: sarcasmRes?.data?.sarcasm_detected,
          literal_meaning: sarcasmRes?.data?.literal_meaning,
          intended_meaning: sarcasmRes?.data?.intended_meaning,
          sarcasm_tone: sarcasmRes?.data?.emotional_tone,
          sarcasm_confidence: sarcasmRes?.data?.confidence_score
        });
        setError('');
        break;
      } catch (err: any) {
        if (i === maxAttempts - 1) {
          setError(err.response?.data?.detail || 'Voice processing failed after multiple attempts.');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    setLoading(false);
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const translationPromise = api.post('/api/translate/', {
        text,
        target_language: targetLanguage
      });
      
      let sarcasmPromise = null;
      if (enableSarcasm) {
          sarcasmPromise = api.post('/api/detect-sarcasm/', { text });
      }

      const [transRes, sarcasmRes] = await Promise.all([
        translationPromise,
        sarcasmPromise ? sarcasmPromise : Promise.resolve(null)
      ]);

      setResult({
        ...transRes.data,
        sarcasm_detected: sarcasmRes?.data?.sarcasm_detected,
        literal_meaning: sarcasmRes?.data?.literal_meaning,
        intended_meaning: sarcasmRes?.data?.intended_meaning,
        sarcasm_tone: sarcasmRes?.data?.emotional_tone,
        sarcasm_confidence: sarcasmRes?.data?.confidence_score
      });
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
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <h2 className="text-gradient mb-4" style={{ fontSize: '2.5rem' }}>Cultural Translator</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px' }}>
          <form onSubmit={handleTranslate}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Text to translate</label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`mic-button ${isListening ? 'listening' : ''}`}
                  style={{
                    background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${isListening ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: isListening ? 'var(--danger)' : 'var(--text)',
                    animation: isListening ? 'pulse 1.5s infinite' : 'none'
                  }}
                  title={isListening ? "Stop listening" : "Click to speak"}
                >
                  {isListening ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="6" height="6"></rect></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                  )}
                </button>
              </div>
              <textarea 
                className="glass-input" 
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a phrase or idiom..."
                required
                suppressHydrationWarning
              />
              {speechError && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{speechError}</div>}
              {isListening && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem', animation: 'pulse 1.5s infinite' }}>Listening...</div>}
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
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="sarcasmToggle" 
                checked={enableSarcasm}
                onChange={(e) => setEnableSarcasm(e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="sarcasmToggle" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Enable Sarcasm Detection
              </label>
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
              
              {result.detected_emotion && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: result.warning_message ? '4px solid var(--warning)' : '4px solid var(--success)' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>Emotion Match Analysis</h4>
                  <p className="text-sm" style={{ marginBottom: '0.25rem' }}><strong>Detected Voice Tone:</strong> {result.detected_emotion} {result.confidence_score ? `(${Math.round(result.confidence_score * 100)}%)` : ''}</p>
                  <p className="text-sm" style={{ marginBottom: '0.25rem' }}><strong>Sentence Context:</strong> {result.sentence_context || result.tone || 'neutral'}</p>
                  <p className="text-sm" style={{ textTransform: 'capitalize', marginBottom: '0.25rem' }}><strong>Status:</strong> {result.emotional_match_status}</p>
                  {result.suggested_tone && (
                    <p className="text-sm" style={{ marginBottom: '0' }}><strong>Suggested Tone:</strong> {result.suggested_tone}</p>
                  )}
                  {result.warning_message && (
                    <div style={{ marginTop: '0.75rem', color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      ⚠️ {result.warning_message}
                    </div>
                  )}
                </div>
              )}
              
              {result.sarcasm_detected !== undefined && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: result.sarcasm_detected ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>Sarcasm Analysis</h4>
                  <p className="text-sm" style={{ marginBottom: '0.25rem' }}><strong>Sarcasm Detected:</strong> {result.sarcasm_detected ? 'Yes' : 'No'} {result.sarcasm_confidence ? `(${Math.round(result.sarcasm_confidence * 100)}%)` : ''}</p>
                  {result.sarcasm_detected && (
                    <>
                      <p className="text-sm" style={{ marginBottom: '0.25rem' }}><strong>Literal Meaning:</strong> {result.literal_meaning}</p>
                      <p className="text-sm" style={{ marginBottom: '0.25rem' }}><strong>Intended Meaning:</strong> {result.intended_meaning}</p>
                      <p className="text-sm" style={{ marginBottom: '0', textTransform: 'capitalize' }}><strong>Emotional Tone:</strong> {result.sarcasm_tone}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
