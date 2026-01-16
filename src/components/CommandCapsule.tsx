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
  
  const [showSettings, setShowSettings] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="capsule-blur" style={{
      position: 'absolute',
      bottom: '3rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '800px',
      borderRadius: '24px',
      padding: '0.8rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 50,
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      
      {/* Loading Bar (Top Border) */}
      {isGenerating && (
        <div className="rgb-loading-bar" style={{ position: 'absolute', top: 0, left: '20px', right: '20px', borderRadius: '2px' }} />
      )}

      {/* Settings Toggle (Left) */}
      <button 
        className="btn-clean" 
        onClick={() => setShowSettings(!showSettings)}
        style={{ color: showSettings ? 'var(--rgb-blue)' : 'var(--text-secondary)' }}
      >
        <Settings size={20} />
      </button>

      {/* Input Field (Center) */}
      <div style={{ flex: 1, position: 'relative' }}>
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
             fontSize: '1rem',
             fontWeight: 300,
             outline: 'none',
             letterSpacing: '0.02em'
           }}
           className="placeholder:text-gray-600"
         />
      </div>

      {/* Inline Quick Settings (Visible when typing presumably, or always?) User said "Selectors integrated" */}
      {/* I will keep them minimal text buttons if !showSettings, or expanded logic */}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
         {/* Ratio Mini-Selector */}
         <button 
           className="btn-clean" 
           onClick={() => setRatio(ratio === "16:9" ? "9:16" : ratio === "9:16" ? "1:1" : "16:9")} // Quick toggle cycle for essential ratios
           style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', minWidth: '40px' }}
           title="Alternar Proporção"
         >
           {ratio}
         </button>

         {/* Res Mini-Selector */}
         <button 
           className="btn-clean" 
           onClick={() => setResolution(resolution === "1K" ? "2K" : "1K")} 
           style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', minWidth: '30px' }}
           title="Resolução"
         >
           {resolution}
         </button>
      </div>


      {/* Main Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="btn-primary-action"
        style={{
            background: isGenerating ? 'transparent' : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            color: 'var(--rgb-green)'
        }}
      >
        {isGenerating ? (
            <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div> 
        ) : (
            <Send size={18} fill="currentColor" />
        )}
      </button>

      {/* Expanded Settings Panel (Floating Above) */}
      {showSettings && (
        <div className="capsule-blur" style={{
            position: 'absolute',
            bottom: '120%',
            left: 0,
            width: '100%',
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            animation: 'slideUp 0.2s ease-out'
        }}>
            {/* Column 1: Ratios */}
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Proporção</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {["1:1", "16:9", "9:16", "3:4", "4:3", "21:9"].map(r => (
                        <button 
                            key={r}
                            onClick={() => setRatio(r)}
                            style={{
                                background: ratio === r ? 'var(--rgb-blue)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '6px',
                                color: ratio === r ? '#000' : 'var(--text-secondary)',
                                fontSize: '0.7rem',
                                padding: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Column 2: Drive/Cloud */}
            <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Armazenamento</label>
                {!isDriveConnected ? (
                    <button 
                        onClick={onConnectDrive}
                        style={{ width: '100%', background: 'rgba(52, 168, 83, 0.1)', color: '#34A853', border: '1px solid rgba(52, 168, 83, 0.3)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <HardDrive size={14} /> Conectar Drive
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34A853', fontSize: '0.8rem' }}>
                             <HardDrive size={12} /> Drive Conectado
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button onClick={() => setSmartSaveMode('flat')} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: smartSaveMode === 'flat' ? 'rgba(255,255,255,0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}>Raiz</button>
                             <button onClick={() => setSmartSaveMode('project')} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: smartSaveMode === 'project' ? 'rgba(255,255,255,0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}>Por Projeto</button>
                        </div>
                    </div>
                )}
            </div>

             {/* Column 3: Resolution */}
             <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Qualidade</label>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {["1K", "2K", "4K"].map(res => (
                        <button 
                            key={res}
                            onClick={() => setResolution(res)}
                            style={{
                                flex: 1,
                                background: resolution === res ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                                color: resolution === res ? '#000' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {res}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
      )}

    </div>
  );
}
