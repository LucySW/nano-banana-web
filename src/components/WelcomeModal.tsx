"use client";
import React, { useState } from 'react';
import { ArrowRight, Key } from 'lucide-react';

interface WelcomeModalProps {
  onComplete: (apiKey: string | null) => void;
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [key, setKey] = useState("");

  const handleSubmit = () => {
    // If key is empty, pass null (user skipped). If not empty, pass key.
    onComplete(key.trim() || null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(15px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.5s ease'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2.5rem',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        }}>
           Motor AI
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Bem-vindo ao seu estúdio criativo. Gere imagens impressionantes usando inteligência artificial de ponta.
          <br/><br/>
          Para começar, conecte sua chave de acesso (pode ser configurada depois).
        </p>

        <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <Key size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-dim)' }} />
            <input 
                type="text" 
                placeholder="Cole sua API Key aqui (Opcional)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 12px 12px 40px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
        </div>

        <button 
            onClick={handleSubmit}
            className="btn-primary"
            style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '12px'
            }}
        >
          {key.trim() ? "Conectar e Iniciar" : "Entrar como Convidado"} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
        </button>

      </div>
    </div>
  );
}
