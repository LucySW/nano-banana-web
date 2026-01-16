"use client";
import React, { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

interface ZeroConfigModalProps {
  onValidate: (key: string) => void;
}

export function ZeroConfigModal({ onValidate }: ZeroConfigModalProps) {
  const [key, setKey] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <div style={{ 
          background: 'var(--bg-card)', 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <KeyRound size={28} color="var(--accent-primary)" />
        </div>
        
        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Conectar Motor AI</h2>
        <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Para gerar imagens, insira sua chave da API.
        </p>

        <input 
          type="password" 
          placeholder="Cole sua Google AI Studio Key aqui..."
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && key && onValidate(key)}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            marginBottom: '1rem',
            textAlign: 'center'
          }}
        />

        <button 
          className="btn-accent" 
          onClick={() => onValidate(key)}
          disabled={!key}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          Validar e Iniciar <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
