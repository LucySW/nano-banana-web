"use client";
import React from 'react';
import { Conversation } from '../types';
import { Folder, Plus, Search, LogIn, LogOut } from 'lucide-react';
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
    <div style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 20,
      borderRight: '1px solid rgba(255,255,255,0.02)'
    }}>
      {/* Header */}
      <div style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Conversas
          </span>
          <button className="btn-clean" onClick={onNew} title="Nova Conversa">
               <Plus size={16} />
          </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {conversations.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.8rem', opacity: 0.5 }}>
            Vazio criativo
          </div>
        )}
        
        {conversations.map(conv => {
            const isActive = conv.id === currentId;
            return (
              <div 
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '0.2rem',
                  position: 'relative',
                  transition: 'all 0.4s ease',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: isActive ? 1 : 0.5,
                  background: isActive ? 'linear-gradient(90deg, rgba(255,255,255,0.03), transparent)' : 'transparent',
                }}
                className={!isActive ? "hover:opacity-100 hover:text-white" : ""}
                onMouseEnter={(e) => {
                    if(!isActive) e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.textShadow = '0 0 15px var(--rgb-blue)';
                }}
                onMouseLeave={(e) => {
                    if(!isActive) e.currentTarget.style.opacity = '0.5';
                    e.currentTarget.style.textShadow = 'none';
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        bottom: '15%',
                        width: '2px',
                        background: 'var(--rgb-green)',
                        boxShadow: '0 0 10px var(--rgb-green)',
                        borderRadius: '0 2px 2px 0'
                    }} />
                )}

                <div style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    letterSpacing: '0.05em'
                }}>
                    {conv.title || "Untitled Project"}
                </div>
              </div>
            );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
         {isGuest ? (
             <button 
                className="btn-primary" 
                style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    fontSize: '0.8rem',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--rgb-blue)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onClick={() => window.location.href = '/login'}
                title="Fazer Login para salvar histórico"
            >
                <LogIn size={14} style={{ marginRight: '0.8rem' }} /> Fazer Login
            </button>
         ) : (
            <button 
                className="btn-clean" 
                title="Sair"
                onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload(); 
                }}
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-dim)', fontSize: '0.8rem' }}
            >
                <LogOut size={14} style={{ marginRight: '0.8rem' }} /> Sair
            </button>
         )}
      </div>
    </div>
  );
}
