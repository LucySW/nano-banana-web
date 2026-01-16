"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Preencha email e senha");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Conta criada! Verifique seu email para confirmar.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      padding: '2rem'
    }}>
      {/* Background Gradient */}
      <div style={{
        position: 'fixed',
        top: '-30%',
        left: '-20%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel slide-up" style={{
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo-r.png" 
            alt="Romsoft Studio AI" 
            style={{ 
              width: '56px', 
              height: '56px', 
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.3))'
            }} 
          />
          <h1 style={{ 
            fontSize: '1.4rem', 
            fontWeight: 500, 
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            <span className="gradient-text">Romsoft Studio</span> AI
          </h1>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.9rem', 
            marginTop: '0.5rem' 
          }}>
            Entre para começar a criar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              width: '100%',
              padding: '14px',
              marginTop: '0.5rem',
              fontSize: '0.95rem'
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <>
                Entrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          margin: '1.5rem 0' 
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.75rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            ou
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Google OAuth */}
        <button 
          onClick={async () => {
            setLoading(true);
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}`,
                queryParams: {
                  access_type: 'offline', 
                  prompt: 'consent',
                  scope: 'https://www.googleapis.com/auth/drive.file email profile openid'
                }
              }
            });
          }}
          disabled={loading}
          className="btn btn-subtle"
          style={{ 
            width: '100%', 
            padding: '12px',
            gap: '10px'
          }}
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            style={{ width: '18px' }} 
          />
          Continuar com Google
        </button>

        {/* Sign Up Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={handleSignUp}
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem' }}
          >
            Não tem conta? <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>Criar agora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
