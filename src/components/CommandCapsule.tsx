"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, HardDrive, Key, Check, X, Loader2 } from 'lucide-react';

interface CommandCapsuleProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  
  ratio: string;
  setRatio: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  
  isDriveConnected: boolean;
  onConnectDrive: () => void;
  smartSaveMode: 'flat' | 'project';
  setSmartSaveMode: (mode: 'flat' | 'project') => void;

  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

export function CommandCapsule({
  prompt, setPrompt, onGenerate, isGenerating,
  ratio, setRatio, resolution, setResolution,
  isDriveConnected, onConnectDrive, smartSaveMode, setSmartSaveMode,
  apiKey, setApiKey
}: CommandCapsuleProps) {
  
  const [showKeyMenu, setShowKeyMenu] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const keyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (keyMenuRef.current && !keyMenuRef.current.contains(event.target as Node)) {
            setShowKeyMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeySubmit = async () => {
      setKeyStatus('validating');
      setTimeout(() => {
          if (tempKey.trim().length > 10) {
              setKeyStatus('success');
              setTimeout(() => {
                  setApiKey(tempKey.trim());
                  localStorage.setItem("romsoft_api_key", tempKey.trim());
                  setShowKeyMenu(false);
                  setKeyStatus('idle');
              }, 1000);
          } else {
              setKeyStatus('error');
              setTimeout(() => {
                  setTempKey("");
                  setKeyStatus('idle');
              }, 1000);
          }
      }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
  };

  const ratios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9", "5:4"];
  const resolutions = ["1K", "2K", "4K"];

  return (
    <div className="capsule-blur" style={{
      position: 'absolute',
      bottom: '3rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '700px',
      borderRadius: '99px',
      padding: '0.6rem 0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      zIndex: 50,
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      
      {/* Loading Bar (Top) */}
      {isGenerating && (
        <div className="rgb-loading-bar" style={{ position: 'absolute', top: 0, left: '20px', right: '20px', borderRadius: '2px', opacity: 0.8 }} />
      )}

      {/* API Key Icon */}
      <div className="hover-menu-trigger" ref={keyMenuRef}>
         <button 
             className="btn-clean" 
             style={{ 
                 color: apiKey ? 'var(--rgb-green)' : '#ef4444',
                 animation: !apiKey ? 'pulse-red 2s infinite' : 'none',
                 padding: '6px'
             }}
             onClick={() => setShowKeyMenu(!showKeyMenu)}
         >
             <Key size={18} />
         </button>
         {showKeyMenu && (
           <div className="hover-menu-content" style={{ bottom: '130%', width: '280px', padding: '1rem' }}>
              {apiKey ? (
                  <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#34A853', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>API Conectada</div>
                      <button 
                         className="btn-clean" 
                         style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: '0 auto', textDecoration: 'underline' }}
                         onClick={() => { setApiKey(null); localStorage.removeItem("romsoft_api_key"); }}
                      >
                          Desconectar
                      </button>
                  </div>
              ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                         type="text" 
                         placeholder="Cole sua API Key aqui..."
                         value={tempKey}
                         onChange={(e) => setTempKey(e.target.value)}
                         style={{
                             flex: 1,
                             background: 'rgba(0,0,0,0.3)',
                             border: '1px solid var(--border-color)',
                             borderRadius: '8px',
                             padding: '8px',
                             color: 'white',
                             fontSize: '0.8rem',
                             outline: 'none'
                         }}
                      />
                      <button 
                         onClick={handleKeySubmit}
                         disabled={keyStatus === 'validating'}
                         style={{
                             background: 'var(--rgb-blue)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             width: '36px',
                             height: '36px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             cursor: 'pointer'
                         }}
                      >
                          {keyStatus === 'validating' ? <Loader2 size={16} className="spin" /> : 
                           keyStatus === 'success' ? <Check size={16} /> :
                           keyStatus === 'error' ? <X size={16} /> :
                           <Check size={16} />}
                      </button>
                  </div>
              )}
           </div>
         )}
      </div>

      {/* Input Field */}
      <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
         <input
           type="text"
           value={prompt}
           onChange={(e) => setPrompt(e.target.value)}
           onKeyDown={handleKeyDown}
           placeholder="O que vamos criar hoje?"
           style={{
             width: '100%',
             background: 'transparent',
             border: 'none',
             color: 'white',
             fontSize: '0.95rem',
             fontWeight: 300,
             outline: 'none',
             letterSpacing: '0.02em'
           }}
           autoFocus
         />
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>

      {/* Inline Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
         
         {/* Ratio Hover Menu */}
         <div className="hover-menu-trigger">
            <button className="btn-clean" style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: '45px', color: 'var(--text-secondary)' }}>
                {ratio}
            </button>
            <div className="hover-menu-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '180px' }}>
                {ratios.map(r => (
                    <button 
                        key={r} 
                        onClick={() => setRatio(r)}
                        style={{
                            background: ratio === r ? 'var(--rgb-blue)' : 'transparent',
                            color: ratio === r ? '#000' : '#fff',
                            border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                        }}
                    >
                        {r}
                    </button>
                ))}
            </div>
         </div>

         {/* Resolution Hover Menu */}
         <div className="hover-menu-trigger">
            <button className="btn-clean" style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: '35px', color: 'var(--text-secondary)' }}>
                {resolution}
            </button>
            <div className="hover-menu-content">
                {resolutions.map(r => (
                    <button 
                        key={r} 
                        onClick={() => setResolution(r)}
                        style={{
                            background: resolution === r ? 'var(--rgb-green)' : 'transparent',
                            color: resolution === r ? '#000' : '#fff',
                            border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left'
                        }}
                    >
                        {r}
                    </button>
                ))}
            </div>
         </div>

         {/* Drive Status */}
         <div className="hover-menu-trigger">
             <button 
                className="btn-clean" 
                style={{ 
                    color: isDriveConnected ? 'var(--rgb-green)' : '#ef4444',
                    position: 'relative'
                }}
                title={isDriveConnected ? "Salvo no Drive" : "Não está salvando"}
             >
                 {isDriveConnected ? (
                    <svg width="18" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                        <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2l-13.75 23.8h27.5z" fill="#00ac47"/>
                        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.4 1.2-2.95 1.2-4.5h-27.5l13.75 23.8c1.55 0 3.1-.4 4.4-1.2z" fill="#ea4335"/>
                        <path d="M43.65 25l-13.75 23.8-13.75 23.8h13.75l13.75-23.8z" fill="#0055aa"/>
                        <path d="M73.55 76.8l-13.75-23.8h-27.5l13.75 23.8z" fill="#00832d"/>
                        <path d="M43.65 25l13.75 23.8 13.75-23.8h-27.5z" fill="#2684fc"/>
                    </svg>
                 ) : (
                     <div style={{ position: 'relative', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HardDrive size={18} color="#ef4444" />
                        <div style={{ position: 'absolute', width: '100%', height: '2px', background: '#ef4444', transform: 'rotate(45deg)' }}></div>
                     </div>
                 )}
             </button>
             <div className="hover-menu-content" style={{ width: '220px' }}>
                {!isDriveConnected ? (
                     <div style={{ textAlign: 'center' }}>
                         <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Não está salvando!</div>
                         <button onClick={onConnectDrive} style={{ width: '100%', padding: '8px', background: 'rgba(52, 168, 83, 0.2)', color: '#4ade80', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <HardDrive size={14} /> Conectar Drive
                         </button>
                     </div>
                ) : (
                    <>
                        <div style={{ fontSize: '0.7rem', color: '#4ade80', padding: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>Drive Conectado</div>
                        <label style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>Salvar em:</label>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                             <button onClick={() => setSmartSaveMode('flat')} style={{ flex: 1, padding: '4px', background: smartSaveMode === 'flat' ? 'rgba(255,255,255,0.2)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Raiz</button>
                             <button onClick={() => setSmartSaveMode('project')} style={{ flex: 1, padding: '4px', background: smartSaveMode === 'project' ? 'rgba(255,255,255,0.2)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Pastas</button>
                        </div>
                    </>
                )}
             </div>
         </div>

      </div>

      {/* Action Button (RGB Flow) */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={!isGenerating && prompt.trim() ? "rgb-flow-border" : ""}
        style={{
            background: isGenerating ? 'transparent' : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'white',
            border: isGenerating || !prompt.trim() ? '1px solid rgba(255,255,255,0.1)' : 'none',
            cursor: isGenerating || !prompt.trim() ? 'default' : 'pointer',
            opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
            transition: 'all 0.3s'
        }}
      >
        {isGenerating ? (
            <div className="spin" style={{ fontSize: '12px' }}>⏳</div> 
        ) : (
            <Send size={18} fill="currentColor" strokeWidth={0} />
        )}
      </button>

    </div>
  );
}
