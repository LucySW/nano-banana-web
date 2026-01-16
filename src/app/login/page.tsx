"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Attempt Login
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
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Conta criada! Verifique seu email.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-deep)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0
      }}></div>

      <div className="glass-panel" style={{
        padding: '3rem 2rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        zIndex: 10,
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
           {/* Breathing Logo */}
           <div 
             className="breathing-logo glow-animated"
             style={{ 
                width: '80px', 
                height: '80px', 
                background: 'url(/logo-r.png)', 
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                margin: '0 auto 1.5rem auto',
                borderRadius: '50%', // Circular glow
                display: 'flex', alignItems: 'center', justifyContent: 'center'
             }}
          >
             {/* Fallback */}
             <Sparkles size={40} color="var(--accent-primary)" style={{ opacity: 0 }} /> 
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Romsoft Studio AI</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Sua porta de entrada para a criatividade infinita.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
             <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease'
                }}
                className="input-glow"
                onFocus={(e) => e.target.style.borderColor = 'var(--rgb-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
          </div>
          
          <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease'
                }}
                className="input-glow"
                onFocus={(e) => e.target.style.borderColor = 'var(--rgb-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary-action"
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                marginTop: '1rem',
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, var(--rgb-blue), var(--accent-primary))',
                color: 'white',
                fontWeight: 600,
                letterSpacing: '0.05em'
            }}
          >
            {loading ? 'Inicializando...' : 'Entrar'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ou continuar com</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
        </div>

        <button 
            onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
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
                if (error) alert(error.message);
            }}
            className="btn-clean"
            style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.8rem',
                padding: '1rem',
                borderRadius: '12px',
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: '20px' }} />
            Google
        </button>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={handleSignUp}
            className="btn-clean"
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
          >
            Ainda não tem acesso? <span style={{ color: 'var(--rgb-green)', marginLeft: '0.3rem' }}>Criar Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
