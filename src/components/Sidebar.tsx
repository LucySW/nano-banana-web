"use client";
import React from 'react';
import { Conversation } from '../types';
import { Folder, Plus, Search, Settings } from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function Sidebar({ conversations, currentId, onSelect, onNew }: SidebarProps) {
  return (
    <div style={{
      width: '280px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Conversas
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-clean" onClick={onNew} title="Nova Conversa">
              <Plus size={18} />
            </button>
            <button className="btn-clean" title="Pesquisar">
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {conversations.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.9rem' }}>
            Nenhuma conversa ainda.
          </div>
        )}
        
        {conversations.map(conv => (
          <div 
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              background: conv.id === currentId ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              borderLeft: conv.id === currentId ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}
          >
            <Folder size={18} color={conv.id === currentId ? 'var(--accent-primary)' : 'var(--text-dim)'} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ 
                color: conv.id === currentId ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: conv.id === currentId ? 500 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.95rem'
              }}>
                {conv.title || "Nova Conversa"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {new Date(conv.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-clean" title="Configurações">
          <Settings size={20} />
        </button>
        <button 
            className="btn-clean" 
            title="Sair da Conta"
            onClick={async () => {
                const { supabase } = await import('../lib/supabase'); // Dynamic import to avoid circular dep if needed, or just import at top
                await supabase.auth.signOut();
                window.location.reload(); // Force reload to trigger auth check in page.tsx
            }}
            style={{ color: '#ef4444' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>SAIR</span>
        </button>
      </div>
    </div>
  );
}
