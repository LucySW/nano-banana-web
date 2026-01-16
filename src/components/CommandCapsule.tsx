"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Settings, ChevronDown, ChevronUp, HardDrive, Info } from 'lucide-react';

interface CommandCapsuleProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  
  // Settings Props
  ratio: string;
  setRatio: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  
  // Drive Props
  isDriveConnected: boolean;
  onConnectDrive: () => void;
  smartSaveMode: 'flat' | 'project';
  setSmartSaveMode: (mode: 'flat' | 'project') => void;
}

export function CommandCapsule({
  prompt, setPrompt, onGenerate, isGenerating,
  ratio, setRatio, resolution, setResolution,
  isDriveConnected, onConnectDrive, smartSaveMode, setSmartSaveMode
}: CommandCapsuleProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
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
      maxWidth: '700px', // Slightly tighter
      borderRadius: '99px', // Fully rounded capsule
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

      {/* Input Field (Expanded) */}
      <div style={{ flex: 1, paddingLeft: '1rem' }}>
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

      {/* --- INLINE CONTROLS --- */}
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

         {/* Drive / Settings (Consolidated Icon) */}
         <div className="hover-menu-trigger">
             <button className="btn-clean" style={{ color: isDriveConnected ? 'var(--rgb-green)' : 'var(--text-secondary)' }}>
                 <HardDrive size={18} />
             </button>
             <div className="hover-menu-content" style={{ width: '200px' }}>
                {!isDriveConnected ? (
                     <button onClick={onConnectDrive} style={{ width: '100%', padding: '8px', background: 'rgba(52, 168, 83, 0.2)', color: '#4ade80', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HardDrive size={14} /> Conectar Google Drive
                     </button>
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

      {/* Action Button (No Blink, RGB Flow) */}
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
            <div style={{ animation: 'spin 1s linear infinite', fontSize: '12px' }}>⏳</div> 
        ) : (
            <Send size={18} fill="currentColor" strokeWidth={0} />
        )}
      </button>

    </div>
  );
}
