"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, HardDrive, Key, Check, X, Loader2, ChevronDown, ImagePlus, AlertTriangle } from 'lucide-react';

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

  // Image attachment (optional)
  onAttachImage?: () => void;
}

// Aspect ratio visual map
const RATIO_VISUALS: Record<string, { label: string; class: string }> = {
  "1:1": { label: "Quadrado", class: "square" },
  "16:9": { label: "Widescreen", class: "wide" },
  "9:16": { label: "Stories/Reels", class: "tall" },
  "4:3": { label: "Clássico", class: "classic" },
  "3:4": { label: "Retrato", class: "portrait" },
  "3:2": { label: "Foto", class: "photo" },
  "2:3": { label: "Foto Vertical", class: "photo-v" },
  "21:9": { label: "Ultrawide", class: "ultra" },
};

export function CommandCapsule({
  prompt, setPrompt, onGenerate, isGenerating,
  ratio, setRatio, resolution, setResolution,
  isDriveConnected, onConnectDrive, smartSaveMode, setSmartSaveMode,
  apiKey, setApiKey,
  onAttachImage
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
                  setTempKey("");
              }, 800);
          } else {
              setKeyStatus('error');
              setTimeout(() => {
                  setTempKey("");
                  setKeyStatus('idle');
              }, 1000);
          }
      }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
  };

  const ratios = Object.keys(RATIO_VISUALS);
  const resolutions = ["1K", "2K", "4K"];

  return (
    <div className="capsule" style={{
      position: 'absolute',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 3rem)',
      maxWidth: '760px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      
      {/* Loading Bar */}
      {isGenerating && (
        <div className="loading-bar" style={{ 
          position: 'absolute', 
          top: 0, 
          left: '16px', 
          right: '16px',
          borderRadius: '1px'
        }} />
      )}

      {/* API Key Button */}
      <div className="dropdown-trigger" ref={keyMenuRef}>
        <button 
          onClick={() => setShowKeyMenu(!showKeyMenu)}
          className="btn-icon"
          style={{ 
            color: apiKey ? 'var(--accent-green)' : 'var(--accent-red)',
            animation: !apiKey ? 'pulse-ring 2s infinite' : 'none'
          }}
          title={apiKey ? "API conectada" : "Configurar API Key"}
        >
          <Key size={18} />
        </button>
        
        {showKeyMenu && (
          <div className="dropdown-content" style={{ width: '280px', padding: '12px' }}>
            {apiKey ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px',
                  color: 'var(--accent-green)', 
                  marginBottom: '8px', 
                  fontSize: '0.85rem', 
                  fontWeight: 500 
                }}>
                  <Check size={14} />
                  API Conectada
                </div>
                <button 
                  onClick={() => { setApiKey(null); localStorage.removeItem("romsoft_api_key"); }}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', width: '100%' }}
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="password" 
                  placeholder="Cole sua API Key..."
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="input"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                  autoFocus
                />
                <button 
                  onClick={handleKeySubmit}
                  disabled={keyStatus === 'validating' || !tempKey.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px' }}
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

      {/* Image Attachment Button */}
      {onAttachImage && (
        <button 
          onClick={onAttachImage}
          className="btn-icon"
          title="Anexar imagem de referência"
        >
          <ImagePlus size={18} />
        </button>
      )}

      {/* Text Input */}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Descreva a imagem que você quer criar..."
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          padding: '8px'
        }}
      />

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

      {/* Ratio Dropdown with Visual Preview */}
      <div className="dropdown-trigger">
        <button className="btn btn-ghost" style={{ 
          fontSize: '0.8rem', 
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div className={`ratio-preview ${RATIO_VISUALS[ratio]?.class || 'wide'}`}></div>
          {ratio}
          <ChevronDown size={12} />
        </button>
        <div className="dropdown-content" style={{ 
          width: '200px',
          padding: '8px'
        }}>
          {ratios.map(r => (
            <button 
              key={r} 
              onClick={() => setRatio(r)}
              className={`dropdown-item ${ratio === r ? 'active' : ''}`}
            >
              <div className={`ratio-preview ${RATIO_VISUALS[r].class}`}></div>
              <span style={{ flex: 1 }}>{r}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{RATIO_VISUALS[r].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Dropdown */}
      <div className="dropdown-trigger">
        <button className="btn btn-ghost" style={{ 
          fontSize: '0.8rem', 
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {resolution}
          <ChevronDown size={12} />
        </button>
        <div className="dropdown-content" style={{ width: '100px' }}>
          {resolutions.map(r => (
            <button 
              key={r} 
              onClick={() => setResolution(r)}
              className={`dropdown-item ${resolution === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Drive Status with Clear Warning */}
      <div className="dropdown-trigger">
        <button 
          className="btn-icon"
          style={{ 
            color: isDriveConnected ? 'var(--accent-green)' : 'var(--accent-orange)',
            position: 'relative'
          }}
          title={isDriveConnected ? "Salvando no Drive" : "⚠️ Imagens NÃO serão salvas!"}
        >
          <HardDrive size={18} />
          {/* Warning dot when not connected */}
          {!isDriveConnected && (
            <span className="status-dot warning" style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '6px',
              height: '6px'
            }}></span>
          )}
        </button>
        <div className="dropdown-content" style={{ width: '220px', padding: '12px' }}>
          {!isDriveConnected ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                color: 'var(--accent-orange)', 
                marginBottom: '8px', 
                fontSize: '0.85rem', 
                fontWeight: 500 
              }}>
                <AlertTriangle size={14} />
                Sem salvamento!
              </div>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem', 
                margin: '0 0 10px',
                lineHeight: 1.4
              }}>
                Suas imagens geradas não serão salvas automaticamente.
              </p>
              <button 
                onClick={onConnectDrive} 
                className="btn btn-success"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <HardDrive size={14} />
                Conectar Google Drive
              </button>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: 'var(--accent-green)', 
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}>
                <Check size={14} />
                Salvando no Drive
              </div>
              <label style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '6px'
              }}>
                Organização:
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '4px',
                background: 'var(--bg-surface)',
                borderRadius: '8px',
                padding: '4px'
              }}>
                <button 
                  onClick={() => setSmartSaveMode('flat')} 
                  className={`btn ${smartSaveMode === 'flat' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
                >
                  Raiz
                </button>
                <button 
                  onClick={() => setSmartSaveMode('project')} 
                  className={`btn ${smartSaveMode === 'project' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
                >
                  Por Conversa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="btn btn-primary"
        style={{
          width: '44px',
          height: '44px',
          padding: 0,
          borderRadius: '50%',
          opacity: (!isGenerating && prompt.trim()) ? 1 : 0.4
        }}
      >
        {isGenerating ? (
          <Loader2 size={20} className="spin" style={{ color: '#000' }} />
        ) : (
          <Send size={20} style={{ color: '#000' }} />
        )}
      </button>

    </div>
  );
}
