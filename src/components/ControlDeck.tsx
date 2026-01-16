"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';

interface ControlDeckProps {
  ratio: string;
  setRatio: (val: string) => void;
  resolution: string;
  setResolution: (val: string) => void;
  smartSaveMode: 'flat' | 'project';
  setSmartSaveMode: (mode: 'flat' | 'project') => void;
}

export function ControlDeck({ 
  ratio, setRatio, 
  resolution, setResolution,
  smartSaveMode, setSmartSaveMode
}: ControlDeckProps) {

  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const ratioMenuRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target as Node)) {
        setShowRatioMenu(false);
      }
      if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
        setShowSaveMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Custom SVG Icons for Aspect Ratios
  const ratios = [
    { value: "21:9", label: "Ultrawide", width: 28, height: 12 },
    { value: "16:9", label: "Cinema", width: 24, height: 13.5 },
    { value: "3:2", label: "Classic", width: 21, height: 14 },
    { value: "4:3", label: "Photo", width: 20, height: 15 },
    { value: "1:1", label: "Square", width: 16, height: 16 },
    { value: "4:5", label: "Portrait", width: 16, height: 20 }, 
    { value: "9:16", label: "Story", width: 11.25, height: 20 }, 
  ];

  const currentRatio = ratios.find(r => r.value === ratio) || ratios[1];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.5rem', 
      marginBottom: '1.5rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
                minWidth: '160px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
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
                            height: '18px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            opacity: ratio === r.value ? 1 : 0.5
                        }}>
                            <svg width="24" height="18" viewBox="0 0 32 24" style={{ fill: 'none', stroke: 'var(--text-primary)', strokeWidth: 2 }}>
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
            Resolution
          </span>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* Smart Save Widget */}
      <div 
        style={{ position: 'relative' }}
        ref={saveMenuRef} // Add ref to track clicks outside
      >
        <button 
            onClick={() => setShowSaveMenu(!showSaveMenu)} // Switch to Click
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: 'var(--success-color)', 
                fontSize: '0.8rem', 
                cursor: 'pointer',
                padding: '6px 12px',
                background: showSaveMenu ? 'var(--bg-input)' : 'transparent', // Visual feedback
                borderRadius: '99px',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s'
            }}
            title="Opções de Salvamento"
        >
            <Save size={16} />
            <span style={{ fontWeight: 600 }}>Auto-Save</span>
            {showSaveMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Click Menu */}
        {showSaveMenu && (
            <div style={{
                position: 'absolute',
                bottom: '130%',
                right: 0,
                width: '240px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '0.8rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                zIndex: 100,
                animation: 'slideUp 0.15s ease'
            }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Salvar Arquivos
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
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>/Downloads/NanoBanana/</div>
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
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>Organizar por Projeto</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>/Project/Image.png</div>
                        </div>
                    </label>
                </div>
            </div>
        )}
      </div>

    </div>
  );
}
