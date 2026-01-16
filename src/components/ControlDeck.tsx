"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, Key, Check, X, Loader2 } from 'lucide-react';

interface ControlDeckProps {
  ratio: string;
  setRatio: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  smartSaveMode: 'flat' | 'project';
  setSmartSaveMode: (mode: 'flat' | 'project') => void;
  isDriveConnected: boolean;
  onConnectDrive: () => void;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

export function ControlDeck({ 
  ratio, setRatio, 
  resolution, setResolution,
  smartSaveMode, setSmartSaveMode,
  isDriveConnected, onConnectDrive,
  apiKey, setApiKey
}: ControlDeckProps) {

  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showKeyMenu, setShowKeyMenu] = useState(false);
  
  const [tempKey, setTempKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  const ratioMenuRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const keyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target as Node)) {
        setShowRatioMenu(false);
      }
      if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
        setShowSaveMenu(false);
      }
      if (keyMenuRef.current && !keyMenuRef.current.contains(event.target as Node)) {
          setShowKeyMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeySubmit = async () => {
      setKeyStatus('validating');
      // Mock validation (or real if we had a check endpoint)
      // Assuming non-empty is 'valid' for now, or check generic structure
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

  // Updated Ratios per User Request (Generic SVG dimensions approximated)
  const ratios = [
    { value: "Auto", label: "Automatic", width: 24, height: 24 }, // Placeholder
    { value: "1:1", label: "Square", width: 20, height: 20 },
    { value: "9:16", label: "TikTok/Reels", width: 11.25, height: 20 },
    { value: "16:9", label: "Cinema", width: 24, height: 13.5 },
    { value: "3:4", label: "Portrait", width: 15, height: 20 },
    { value: "4:3", label: "Standard", width: 20, height: 15 },
    { value: "3:2", label: "Classic", width: 21, height: 14 },
    { value: "2:3", label: "Tall", width: 14, height: 21 },
    { value: "5:4", label: "Print", width: 18, height: 14.4 },
    { value: "4:5", label: "Instagram", width: 14.4, height: 18 },
    { value: "21:9", label: "Ultrawide", width: 28, height: 12 },
  ];

  const currentRatio = ratios.find(r => r.value === ratio) || ratios[1];

  return (
    <div className='glass-panel' style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.5rem', 
      marginBottom: '1.5rem',
      padding: '0.75rem 1.5rem',
      borderRadius: '24px',
      transition: 'box-shadow 0.3s ease',
    }}>
      
      {/* Ratio Dropdown */}
      <div style={{ position: 'relative' }} ref={ratioMenuRef}>
        <button 
            onClick={() => setShowRatioMenu(!showRatioMenu)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: '4px'
            }}
        >
            <div style={{ 
                width: '32px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(var(--accent-primary-rgb), 0.1)',
                borderRadius: '6px'
            }}>
                <svg width="32" height="24" viewBox="0 0 32 24" style={{ fill: 'none', stroke: 'var(--accent-primary)', strokeWidth: 2 }}>
                    <rect 
                        x={(32 - currentRatio.width) / 2} 
                        y={(24 - currentRatio.height) / 2} 
                        width={currentRatio.width} 
                        height={currentRatio.height} 
                        rx="2"
                    />
                </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1 }}>{currentRatio.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.2 }}>{currentRatio.label}</div>
            </div>
            {showRatioMenu ? <ChevronUp size={14} color="var(--text-dim)" /> : <ChevronDown size={14} color="var(--text-dim)" />}
        </button>

        {/* Dropdown Menu */}
        {showRatioMenu && (
            <div style={{
                position: 'absolute',
                bottom: '130%',
                left: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.5rem',
                minWidth: '180px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                {ratios.map(r => (
                    <button
                        key={r.value}
                        onClick={() => {
                            setRatio(r.value);
                            setShowRatioMenu(false);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: ratio === r.value ? 'var(--bg-input)' : 'transparent',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                        }}
                    >
                        <div style={{ 
                            width: '24px', 
                            height: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            opacity: ratio === r.value ? 1 : 0.5
                        }}>
                            <svg width="24" height="20" viewBox="0 0 32 24" style={{ fill: 'none', stroke: 'var(--text-primary)', strokeWidth: 2 }}>
                                <rect 
                                    x={(32 - r.width) / 2} 
                                    y={(24 - r.height) / 2} 
                                    width={r.width} 
                                    height={r.height} 
                                    rx="2"
                                />
                            </svg>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{r.value}</span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{r.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', opacity: 0.5 }}></div>

      {/* Resolution Selector (Simple) */}
      <div style={{ position: 'relative' }}>
          <select 
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                padding: '6px 0',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                minWidth: '80px',
                textAlign: 'center'
            }}
          >
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
          </select>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
            Result
          </span>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* API Key Widget */}
      <div 
        style={{ position: 'relative' }}
        ref={keyMenuRef}
        onMouseEnter={() => setShowKeyMenu(true)}
        onMouseLeave={() => !keyMenuRef.current?.contains(document.activeElement) && setShowKeyMenu(false)}
      >
          <button
             style={{
                 background: apiKey ? 'rgba(52, 168, 83, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                 border: apiKey ? '1px solid rgba(52, 168, 83, 0.3)' : '1px solid rgba(239, 68, 68, 0.5)',
                 color: apiKey ? '#34A853' : '#ef4444',
                 width: '40px', 
                 height: '40px',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 animation: !apiKey ? 'pulse-red 2s infinite' : 'none',
                 boxShadow: !apiKey ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                 transition: 'all 0.3s'
             }}
             title={apiKey ? "API Key Configurada" : "Configurar API Key"}
          >
              <Key size={18} />
          </button>

          {/* Hover Menu */}
          {showKeyMenu && (
              <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  zIndex: 101,
                  minWidth: '280px',
                  animation: 'fadeIn 0.2s ease'
              }}>
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
                            placeholder="sk-..."
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

      {/* Drive Save Widget */}
      <div 
        style={{ position: 'relative' }}
        ref={saveMenuRef} 
      >
        <button 
            onClick={() => setShowSaveMenu(!showSaveMenu)}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: isDriveConnected ? 'var(--text-primary)' : '#ef4444', 
                fontSize: '0.8rem', 
                cursor: 'pointer',
                padding: '6px 16px',
                background: showSaveMenu ? 'var(--bg-input)' : (isDriveConnected ? 'rgba(52, 168, 83, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                borderRadius: '99px',
                border: isDriveConnected ? '1px solid rgba(52, 168, 83, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s',
                position: 'relative'
            }}
            title={isDriveConnected ? "Salvo no Drive" : "Não está salvando"}
        >
            {isDriveConnected ? (
                 // Drive Icon (Green) - Using SVG for branding
                 <svg width="18" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2l-13.75 23.8h27.5z" fill="#00ac47"/>
                    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.4 1.2-2.95 1.2-4.5h-27.5l13.75 23.8c1.55 0 3.1-.4 4.4-1.2z" fill="#ea4335"/>
                    <path d="M43.65 25l-13.75 23.8-13.75 23.8h13.75l13.75-23.8z" fill="#0055aa"/>
                    <path d="M73.55 76.8l-13.75-23.8h-27.5l13.75 23.8z" fill="#00832d"/>
                    <path d="M43.65 25l13.75 23.8 13.75-23.8h-27.5z" fill="#2684fc"/>
                 </svg>
            ) : (
                 // Disconnected Icon (Red with slash)
                 <div style={{ position: 'relative' }}>
                    <Loader2 size={16} className={isDriveConnected ? "" : "hidden"} /> 
                    {/* Fallback cloud-off or similar */}
                    <div style={{ width: '18px', height: '18px', border: '2px solid #ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ width: '100%', height: '2px', background: '#ef4444', transform: 'rotate(45deg)' }}></div>
                    </div>
                 </div>
            )}
            
            <span style={{ fontWeight: 600 }}>{isDriveConnected ? "Drive" : "Sem Salvar"}</span>
            
            {!isDriveConnected && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: '#ef4444',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    animation: 'fadeOut 5s forwards', // Disappears after 5s
                    pointerEvents: 'none'
                }}>
                    Não está salvando!
                </div>
            )}

            {isDriveConnected && (showSaveMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </button>

        {/* Menu Logic */}
        {showSaveMenu && (
            <div style={{
                position: 'absolute',
                bottom: '130%',
                right: 0,
                width: '260px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                zIndex: 100,
                animation: 'slideUp 0.15s ease'
            }}>
                {!isDriveConnected ? (
                    <div style={{ textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Salvar na Nuvem</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                            Conecte seu Google Drive para salvar automaticamente suas gerações em alta resolução.
                        </p>
                        <button 
                            onClick={onConnectDrive}
                            className="btn-primary"
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                fontSize: '0.85rem',
                                padding: '8px' 
                            }}
                        >
                            Vincular Google Drive
                        </button>
                    </div>
                ) : (
                    <>
                        <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Organização no Drive
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.6rem', borderRadius: '8px', background: smartSaveMode === 'flat' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: smartSaveMode === 'flat' ? '4px solid var(--accent-primary)' : '2px solid var(--text-dim)', boxSizing: 'border-box' }}></div>
                                <input 
                                    type="radio" 
                                    name="smartSave" 
                                    checked={smartSaveMode === 'flat'} 
                                    onChange={() => { setSmartSaveMode('flat'); setShowSaveMenu(false); }}
                                    style={{ display: 'none' }}
                                />
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>Pasta Única</div>
                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>/NanoBanana (Raiz)</div>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.6rem', borderRadius: '8px', background: smartSaveMode === 'project' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: smartSaveMode === 'project' ? '4px solid var(--accent-primary)' : '2px solid var(--text-dim)', boxSizing: 'border-box' }}></div>
                                <input 
                                    type="radio" 
                                    name="smartSave" 
                                    checked={smartSaveMode === 'project'} 
                                    onChange={() => { setSmartSaveMode('project'); setShowSaveMenu(false); }}
                                    style={{ display: 'none' }}
                                />
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>Por Projeto</div>
                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>/NomeDoProjeto/Image.png</div>
                                </div>
                            </label>
                        </div>
                    </>
                )}
            </div>
        )}
      </div>

    </div>
  );
}
