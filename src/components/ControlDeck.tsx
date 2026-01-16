"use client";
import React, { useState } from 'react';
import { Save } from 'lucide-react';

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

  const [showSaveMenu, setShowSaveMenu] = useState(false);

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

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.5rem', 
      marginBottom: '1.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      
      {/* Ratio Selector */}
      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {ratios.map(r => (
            <button
                key={r.value}
                onClick={() => setRatio(r.value)}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: ratio === r.value ? 1 : 0.5,
                    transition: 'all 0.2s',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    minWidth: '40px'
                }}
            >
                {/* Text Label */}
                <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    color: ratio === r.value ? 'var(--accent-primary)' : 'var(--text-dim)',
                    whiteSpace: 'nowrap'
                }}>
                    {r.value}
                </span>

                {/* SVG Icon */}
                <div style={{ 
                    width: '32px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: ratio === r.value ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                    borderRadius: '4px'
                }}>
                    <svg width="32" height="24" viewBox="0 0 32 24" style={{ fill: 'none', stroke: ratio === r.value ? 'var(--accent-primary)' : 'currentColor', strokeWidth: 2 }}>
                        <rect 
                            x={(32 - r.width) / 2} 
                            y={(24 - r.height) / 2} 
                            width={r.width} 
                            height={r.height} 
                            rx="2"
                        />
                    </svg>
                </div>
            </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '30px', background: 'var(--border-color)', opacity: 0.5 }}></div>

      {/* Resolution Selector */}
      <div style={{ position: 'relative' }}>
          <select 
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '100px'
            }}
          >
              <option value="1K">1K • Fast</option>
              <option value="2K">2K • Detail</option>
              <option value="4K">4K • Ultra</option>
          </select>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* Smart Save Widget */}
      <div 
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowSaveMenu(true)}
        onMouseLeave={() => setShowSaveMenu(false)}
      >
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--success-color)', 
            fontSize: '0.8rem', 
            cursor: 'help',
            padding: '8px 12px',
            background: 'var(--bg-input)',
            borderRadius: '8px',
            border: '1px solid transparent'
        }}>
            <Save size={16} />
            <span style={{ fontWeight: 600 }}>Auto-Save</span>
        </div>

        {/* Hover Menu */}
        {showSaveMenu && (
            <div style={{
                position: 'absolute',
                bottom: '120%',
                right: 0,
                width: '280px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 100,
                animation: 'slideUp 0.2s ease'
            }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Estratégia de Salvamento</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', background: smartSaveMode === 'flat' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                        <input 
                            type="radio" 
                            name="smartSave" 
                            checked={smartSaveMode === 'flat'} 
                            onChange={() => setSmartSaveMode('flat')}
                        />
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Pasta Única</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>/Downloads/NanoBanana/Image.png</div>
                        </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', background: smartSaveMode === 'project' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                        <input 
                            type="radio" 
                            name="smartSave" 
                            checked={smartSaveMode === 'project'} 
                            onChange={() => setSmartSaveMode('project')}
                        />
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Por Projeto</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>/Downloads/NanoBanana/ProjectA/..</div>
                        </div>
                    </label>
                </div>
            </div>
        )}
      </div>

    </div>
  );
}
