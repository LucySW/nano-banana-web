"use client";
import React from 'react';
import { Conversation } from '../types';
import { Plus, LogIn, LogOut, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isGuest: boolean;
}

export function Sidebar({ conversations, currentId, onSelect, onNew, isGuest }: SidebarProps) {
  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      background: 'var(--bg-elevated)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo-r.png" alt="Logo" style={{ width: '28px', height: '28px' }} />
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}>
            Romsoft Studio
          </span>
        </div>
        <button 
          onClick={onNew} 
          className="btn-icon"
          title="Nova Conversa"
          style={{ 
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Conversations List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {conversations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            padding: '2rem 1rem', 
            fontSize: '0.85rem' 
          }}>
            <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>Nenhuma conversa ainda</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
              Clique em + para começar
            </p>
          </div>
        ) : (
          conversations.map(conv => {
            const isActive = conv.id === currentId;
            return (
              <div 
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  padding: '10px 12px',
                  marginBottom: '2px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: '3px',
                    background: 'var(--accent-blue)',
                    borderRadius: '0 2px 2px 0'
                  }} />
                )}

                <MessageSquare size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                <span style={{ 
                  flex: 1,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {conv.title || "Nova Conversa"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        {isGuest ? (
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <LogIn size={16} />
            Fazer Login
          </button>
        ) : (
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload(); 
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        )}
      </div>
    </aside>
  );
}
