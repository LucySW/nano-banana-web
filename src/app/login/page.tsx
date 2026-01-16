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
      color: 'var(--text-primary)'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
          <h1>Romsoft Studio AI</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sua conta, seus projetos, em qualquer lugar.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '0.8rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '0.8rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none'
            }}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="btn-accent"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
          >
            {loading ? 'Carregando...' : 'Entrar'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            onClick={handleSignUp}
            className="btn-clean"
            style={{ fontSize: '0.9rem' }}
          >
            Não tem conta? <span style={{ color: 'var(--accent-primary)' }}>Criar Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
