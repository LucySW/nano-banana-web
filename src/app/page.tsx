"use client";
import { useState, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { ZeroConfigModal } from '../components/ZeroConfigModal';
import { Sidebar } from '../components/Sidebar';
import { CommandCapsule } from '../components/CommandCapsule';
import { Sparkles, Cloud, LogIn, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { uploadImageToDrive } from '../lib/drive';
import { WelcomeModal } from '../components/WelcomeModal'; // Ensure import exists

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // Restored State

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New States
  const [isGuest, setIsGuest] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const router = useRouter();
      
      {/* Welcome Modal (Onboarding) */}
      {showWelcomeModal && (
        <WelcomeModal onComplete={handleWelcomeComplete} />
      )}

      {/* API Key Modal (On Demand) */}
      {showKeyModal && (
        <ZeroConfigModal onValidate={handleValidate} />
      )}

      <Sidebar 
        conversations={conversations} 
        currentId={currentId} 
        onSelect={handleSelectProject} 
        onNew={handleNewConversation} 
        isGuest={isGuest}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', position: 'relative' }}>
        
        {/* Top Right Utilities (Minimalist) */}
        <div style={{ 
            position: 'absolute',
            top: '1.5rem',
            right: '2rem',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
        }}>
            {/* Cloud Status */}
            <div title={syncing ? "Sincronizando..." : "Nuvem Salva"} style={{ opacity: syncing ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                <Cloud size={20} color={syncing ? 'var(--rgb-blue)' : 'var(--text-secondary)'} />
            </div>

            {/* Profile / Guest */}
            {isGuest ? (
                <button 
                    onClick={() => router.push('/login')}
                    className="btn-clean"
                    style={{ 
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.4rem 1rem',
                        fontSize: '0.75rem',
                        borderRadius: '99px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0,0,0,0.3)'
                    }}
                >
                    <div style={{ width: '8px', height: '8px', background: '#fbbf24', borderRadius: '50%' }}></div>
                    Convidado
                </button>
            ) : (
                <button className="btn-clean">
                    <User size={20} />
                </button>
            )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '200px' }}>
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            <div style={{ marginTop: '30vh', textAlign: 'center', opacity: 1 }}>
               {/* Breathing Logo Area */}
              <div 
                 className="breathing-logo"
                 style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: 'url(/logo-r.png)', /* Placeholder - Assuming asset exists or use SVG */
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    margin: '0 auto 2rem auto',
                    // Fallback if no image:
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}
              >
                  {/* Fallback SVG Logo if image fails or for immediate visual */}
                 <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="6" style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))'}}>
                    <path d="M30 20 H60 Q80 20 80 45 Q80 70 60 70 H30 V20 Z" />
                    <path d="M60 70 L90 100" />
                 </svg>
              </div>

              <h1 className="text-spaced" style={{ margin: '0 0 0.5rem 0', fontWeight: 300, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Romsoft Studio AI</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 300 }}>O que vamos criar hoje?</p>
            </div>
          ) : (
            activeConversation.messages.map(msg => (
                <div key={msg.id} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.role === 'user' ? '60%' : '100%',
                    marginBottom: '1rem' // Spacing
                }}>
                    {msg.role === 'user' ? (
                        <div style={{ 
                            background: 'transparent', 
                            padding: '1rem', 
                            borderRadius: '16px',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            textAlign: 'right',
                            fontSize: '1.1rem',
                            fontWeight: 300
                        }}>
                             {msg.content}
                        </div>
                    ) : (
                        <div className="ai-message-container" style={{ animation: 'fadeIn 0.5s ease' }}>
                            <div className="glass-panel" style={{ 
                                padding: '4px', 
                                borderRadius: '16px',
                                overflow: 'hidden'
                             }}>
                                <img 
                                    src={msg.content.startsWith('http') ? msg.content : `data:image/png;base64,${msg.content}`} 
                                    style={{ display: 'block', width: 'auto', maxHeight: '70vh', borderRadius: '12px' }}
                                />
                            </div>
                            <div style={{
                                paddingLeft: '0.5rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', gap: '0.5rem'
                            }}
                            title="Metadata">
                                <span style={{ color: 'var(--rgb-blue)' }}>{msg.metadata?.ratio || "Ratio"}</span>
                                <span> • </span>
                                <span>{msg.metadata?.resolution || "Res"}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))
          )}
          
          {loading && (
             <div className="shimmer-frame" style={{ width: '100%', height: '400px', maxWidth: '600px', borderRadius: '16px' }}></div>
          )}
        </div>

        {/* Floating Command Capsule */}
        <CommandCapsule 
            prompt={input} setPrompt={setInput}
            onGenerate={handleGenerate}
            isGenerating={loading}
            ratio={ratio} setRatio={setRatio}
            resolution={resolution} setResolution={setResolution}
            smartSaveMode={smartSaveMode} setSmartSaveMode={setSmartSaveMode}
            isDriveConnected={!!(userSession?.provider_token)}
            onConnectDrive={handleConnectDrive}
        />
        
      </div>
    </div>
  );
}
