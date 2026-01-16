"use client";
import React, { useState } from 'react';
import { Settings, Save, Monitor, Square, Smartphone, Film, Disc } from 'lucide-react'; // Example icons

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

  const ratios = [
    { value: "16:9", label: "Cinema", icon: <Monitor size={16} /> },
    { value: "1:1", label: "Square", icon: <Square size={16} /> },
    { value: "9:16", label: "Story", icon: <Smartphone size={16} /> },
    { value: "21:9", label: "Wide", icon: <Film size={16} /> },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      marginBottom: '1rem',
      padding: '0.5rem',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      
      {/* Ratio Selector */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px' }}>
        {ratios.map(r => (
            <button
                key={r.value}
                onClick={() => setRatio(r.value)}
                title={r.label}
                style={{
                    background: ratio === r.value ? 'var(--accent-primary)' : 'transparent',
                    color: ratio === r.value ? 'white' : 'var(--text-dim)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {r.icon}
            </button>
        ))}
      </div>

      {/* Resolution Selector */}
      <div style={{ position: 'relative' }}>
          <select 
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
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
            padding: '6px 12px',
            background: 'var(--bg-input)',
            borderRadius: '8px'
        }}>
            <Save size={16} />
            <span style={{ fontWeight: 600 }}>Auto-Save ON</span>
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
