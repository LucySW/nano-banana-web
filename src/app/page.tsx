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
import { WelcomeModal } from '../components/WelcomeModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New States
  const [isGuest, setIsGuest] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const router = useRouter();
  
  // Settings State
  const [ratio, setRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1K");
  const [smartSaveMode, setSmartSaveMode] = useState<'flat' | 'project'>('flat');

  // Welcome Modal Logic
  useEffect(() => {
    // Check for API key on mount
    const stored = localStorage.getItem("romsoft_api_key");
    if (stored) {
        setApiKey(stored);
    } else {
        // Only show welcome if no key is found
        // Use timeout to prevent hydration mismatch flicker
        setTimeout(() => setShowWelcomeModal(true), 500);
    }
  }, []);

  const handleWelcomeComplete = (key: string | null) => {
    if (key) {
        setApiKey(key);
        localStorage.setItem("romsoft_api_key", key);
    }
    setShowWelcomeModal(false);
  };

  
  // --- LOAD PROJECTS (Cloud) ---
  const loadCloudProjects = async (userId: string) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (data) {
        const mapped: Conversation[] = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            messages: [], 
            createdAt: p.created_at
        }));
        return mapped;
    }
    return [];
  };

  // --- SYNC LOGIC (Local -> Cloud) ---
  const syncLocalToCloud = async (userId: string) => {
    const local = localStorage.getItem('romsoft_conversations');
    if (!local) return;

    try {
        const localConvs: Conversation[] = JSON.parse(local);
        if (localConvs.length === 0) return;

        setSyncing(true);
        console.log("Syncing local projects to cloud...");

        for (const conv of localConvs) {
            // 1. Create Project in DB
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .insert([{ user_id: userId, title: conv.title }])
                .select()
                .single();
            
            if (projData) {
                // 2. Upload Messages
                for (const msg of conv.messages) {
                    await supabase.from('generations').insert({
                        project_id: projData.id,
                        role: msg.role,
                        content: msg.content, 
                        prompt_text: msg.textPrompt,
                        ratio: msg.metadata?.ratio,
                        resolution: msg.metadata?.resolution,
                        temperature: msg.metadata?.temp
                    });
                }
            }
        }
        
        // Clear local after sync
        localStorage.removeItem('romsoft_conversations');
        console.log("Sync complete.");
        setSyncing(false);
    } catch (e) {
        console.error("Sync failed", e);
    }
  };

  // --- LOAD MESSAGES (Cloud) ---
  const loadCloudMessages = async (projectId: string) => {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (data) {
          const mappedMsgs: Message[] = data.map((g: any) => ({
              id: g.id,
              role: g.role,
              content: g.content, 
              textPrompt: g.prompt_text,
              metadata: {
                  timestamp: g.created_at,
                  ratio: g.ratio,
                  resolution: g.resolution,
                  temp: g.temperature
              }
          }));
          
          setConversations(prev => prev.map(c => {
              if (c.id === projectId) {
                  return { ...c, messages: mappedMsgs };
              }
              return c;
          }));
      }
  };

  useEffect(() => {
    // Auth & Init Logic
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // --- LOGGED IN ---
        setIsGuest(false);
        setUserSession(session);
        
        // 1. Sync any pending local data
        await syncLocalToCloud(session.user.id);

        // 2. Load Cloud Data
        const cloudProjects = await loadCloudProjects(session.user.id);
        setConversations(cloudProjects);
        if (cloudProjects.length > 0) {
            setCurrentId(cloudProjects[0].id);
            loadCloudMessages(cloudProjects[0].id);
        }

      } else {
        // --- GUEST MODE ---
        setIsGuest(true);
        const savedConvs = localStorage.getItem('romsoft_conversations');
        if (savedConvs) {
          const parsed = JSON.parse(savedConvs);
          setConversations(parsed);
          if (parsed.length > 0) setCurrentId(parsed[0].id);
        }
      }
    };
    init();

    // Load API Key (Local Setting)
    const key = localStorage.getItem('romsoft_key');
    if (key) {
      setApiKey(key);
    } 
  }, []);

  // Sync LocalStorage if Guest
  useEffect(() => {
    if (isGuest && conversations.length > 0) {
        localStorage.setItem('romsoft_conversations', JSON.stringify(conversations));
    }
  }, [conversations, isGuest]);

  const handleSelectProject = (id: string) => {
      setCurrentId(id);
      if (!isGuest) {
          loadCloudMessages(id);
      }
  };

  const handleValidate = (key: string) => {
    localStorage.setItem('romsoft_key', key);
    setApiKey(key);
    setShowKeyModal(false);
    // If conversations empty, start new
    if (conversations.length === 0) handleNewConversation();
  };

  const handleNewConversation = async () => {
    const newTitle = "Nova Ideia";
    const newId = generateId();

    if (isGuest) {
        const newConv: Conversation = {
            id: newId,
            title: newTitle,
            messages: [],
            createdAt: new Date().toISOString()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentId(newConv.id);
    } else {
        // Create in DB
        if (!userSession?.user) return;
        const { data } = await supabase
            .from('projects')
            .insert([{ user_id: userSession.user.id, title: newTitle }])
            .select()
            .single();
        
        if (data) {
            const newConv: Conversation = {
                id: data.id,
                title: data.title,
                messages: [],
                createdAt: data.created_at
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentId(newConv.id);
        }
    }
  };

  const activeConversation = conversations.find(c => c.id === currentId);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    // 1. Check API Key
    if (!apiKey) {
        setShowKeyModal(true);
        return;
    }
    
    // Ensure active conversation
    let currentConv = activeConversation;
    if (!currentConv) {
         if (conversations.length === 0) {
             await handleNewConversation();
             return; 
         }
    }
    
    if (!currentConv) return;

    // Optimistic Update
    const tempId = generateId();
    const userMsg: Message = { id: tempId, role: 'user', content: input };
    let updatedConv = { ...currentConv, messages: [...currentConv.messages, userMsg] };
    
    // Update Title if first message
    let isFirst = currentConv.messages.length === 0;
    if (isFirst) {
        const newTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
        updatedConv.title = newTitle;
        if (!isGuest) {
            supabase.from('projects').update({ title: newTitle }).eq('id', currentConv.id).then();
        }
    }

    setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
    
    // Save User Msg
    if (!isGuest) {
        supabase.from('generations').insert({
            project_id: currentConv.id,
            role: 'user',
            content: input
        }).then();
    }

    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          prompt: input, 
          ratio,
          resolution,
          temperature: 0.7, 
          style: "Pro",
          lighting: "Studio Lighting"
        })
      });

      const data = await response.json();

      if (data.success && data.image) {
        const aiMsg: Message = {
            id: generateId(),
            role: 'model',
            content: data.image,
            textPrompt: input,
            metadata: {
                timestamp: new Date().toISOString(),
                ratio,
                resolution,
                temp: 0.7
            }
        };

        updatedConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg] };
        setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
        
        if (!isGuest && userSession?.provider_token) {
            // --- GOOGLE DRIVE UPLOAD ---
            console.log("Uploading to Drive...");
            try {
                // Determine Folder Name based on Smart Save Mode
                const folderName = smartSaveMode === 'project' ? updatedConv.title.replace(/[^a-z0-9 ]/gi, '').trim() : undefined;

                const driveResult = await uploadImageToDrive(
                    userSession.provider_token, 
                    data.image, 
                    `NanoBanana_${Date.now()}.png`,
                    folderName
                );
                
                // Save Message with Drive Link
                await supabase.from('generations').insert({
                    project_id: currentConv.id,
                    role: 'model',
                    content: driveResult.webViewLink || data.image, // Use link if available
                    prompt_text: input,
                    ratio,
                    resolution,
                    temperature: 0.7
                });
                console.log("Saved to Drive:", driveResult.webViewLink);
                
            } catch (driveErr) {
                console.error("Drive upload failed, using DB fallback", driveErr);
                // Fallback to storing base64
                await supabase.from('generations').insert({
                    project_id: currentConv.id,
                    role: 'model',
                    content: data.image,
                    prompt_text: input,
                    ratio,
                    resolution,
                    temperature: 0.7
                });
            }
        } else if (!isGuest) {
             // Logged in but no Google Token (e.g. Email login) -> DB Storage
             await supabase.from('generations').insert({
                project_id: currentConv.id,
                role: 'model',
                content: data.image,
                prompt_text: input,
                ratio,
                resolution,
                temperature: 0.7
            });
        }

      } else {
        alert("Erro na geração: " + (data.error || "Desconhecido"));
      }

    } catch (e) {
      console.error(e);
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDrive = async () => {
      await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
              redirectTo: window.location.origin,
              queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                  scope: 'email profile openid https://www.googleapis.com/auth/drive.file'
              }
          }
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
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
            <div title={syncing ? "Sincronizando..." : "Nuvem Salva"} style={{ opacity: syncing ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <Cloud size={18} color={syncing ? 'var(--rgb-blue)' : 'var(--text-secondary)'} />
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
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <div style={{ width: '6px', height: '6px', background: '#fbbf24', borderRadius: '50%' }}></div>
                    Convidado (Entrar)
                </button>
            ) : (
                <button className="btn-clean" title={userSession?.user?.email} style={{ padding: 0, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {userSession?.user?.user_metadata?.avatar_url ? (
                        <img src={userSession.user.user_metadata.avatar_url} alt="User" style={{ width: '32px', height: '32px' }} />
                    ) : (
                        <div style={{ width: '32px', height: '32px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} />
                        </div>
                    )}
                </button>
            )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 15%', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '200px' }}>
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            <div style={{ marginTop: '20vh', textAlign: 'center', opacity: 1 }}>
               {/* Breathing Logo Area */}
              <div 
                 className="breathing-logo rgb-flow-border"
                 style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: 'url(/logo-r.png)', 
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    margin: '0 auto 1.5rem auto',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}
              >
                  {/* Fallback SVG Logo if image fails or for immediate visual */}
                 <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="6" style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))', display: 'none' }}>
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
