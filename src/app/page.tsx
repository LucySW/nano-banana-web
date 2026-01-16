"use client";
import { useState, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { ZeroConfigModal } from '../components/ZeroConfigModal';
import { Sidebar } from '../components/Sidebar';
import { ControlDeck } from '../components/ControlDeck';
import { Sparkles, Cloud, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { uploadImageToDrive } from '../lib/drive';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
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
      setIsLocked(false);
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
    setIsLocked(false);
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
    if (!input.trim() || !activeConversation || !apiKey) return;
    
    // Optimistic Update
    const tempId = generateId();
    const userMsg: Message = { id: tempId, role: 'user', content: input };
    let updatedConv = { ...activeConversation, messages: [...activeConversation.messages, userMsg] };
    
    // Update Title if first message
    let isFirst = activeConversation.messages.length === 0;
    if (isFirst) {
        const newTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
        updatedConv.title = newTitle;
        if (!isGuest) {
            supabase.from('projects').update({ title: newTitle }).eq('id', activeConversation.id).then();
        }
    }

    setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
    
    // Save User Msg
    if (!isGuest) {
        supabase.from('generations').insert({
            project_id: activeConversation.id,
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
                const driveResult = await uploadImageToDrive(
                    userSession.provider_token, 
                    data.image, 
                    `NanoBanana_${Date.now()}.png`
                );
                
                // Save Message with Drive Link
                await supabase.from('generations').insert({
                    project_id: activeConversation.id,
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
                    project_id: activeConversation.id,
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
                project_id: activeConversation.id,
                role: 'model',
                content: data.image,
                prompt_text: input,
                ratio,
                resolution,
                temperature: 0.7
            });
        }

        // --- CLIENT SIDE DOWNLOAD (Smart Save) ---
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const projectNameClean = updatedConv.title.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
        let filename = `NanoBanana_${timestamp}`;
        if (smartSaveMode === 'project') {
            filename = `NanoBanana_${projectNameClean}_${timestamp}`;
        }

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${data.image}`;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

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

  if (isLocked) {
    return <ZeroConfigModal onValidate={handleValidate} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar 
        conversations={conversations} 
        currentId={currentId} 
        onSelect={handleSelectProject} 
        onNew={handleNewConversation} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', position: 'relative' }}>
        
        {/* Guest Banner */}
        {isGuest && (
            <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderBottom: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '0.5rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
            }}>
                <span style={{ fontSize: '0.85rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cloud size={16} /> Modo Convidado: Dados salvos apenas neste computador.
                </span>
                <button 
                    onClick={() => router.push('/login')}
                    className="btn-accent"
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', height: 'auto', background: 'var(--accent-primary)' }}
                >
                    <LogIn size={14} style={{ marginRight: '0.4rem' }} />
                    Entrar e Sincronizar
                </button>
            </div>
        )}

        {/* Syncing Indicator */}
        {syncing && (
             <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)', 
                padding: '0.5rem 1rem', 
                textAlign: 'center',
                color: '#60a5fa',
                fontSize: '0.8rem'
            }}>
                Sincronizando seus projetos antigos para a nuvem...
            </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '200px' }}>
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div style={{ marginTop: '20vh', textAlign: 'center', opacity: 0.4 }}>
              <Sparkles size={64} style={{ marginBottom: '1rem' }} />
              <h1>Romsoft Studio AI</h1>
              <p>O que vamos criar hoje?</p>
            </div>
          ) : (
            activeConversation.messages.map(msg => (
                <div key={msg.id} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.role === 'user' ? '60%' : '100%',
                }}>
                    {msg.role === 'user' ? (
                        <div style={{ 
                            background: 'var(--bg-input)', 
                            padding: '1rem', 
                            borderRadius: '16px 16px 0 16px',
                            color: 'var(--text-primary)',
                        }}>
                             {msg.content}
                        </div>
                    ) : (
                        <div className="ai-message-container">
                            <div style={{ 
                                border: '1px solid var(--border-color)', 
                                padding: '4px', 
                                background: 'var(--bg-card)',
                                borderRadius: '12px'
                             }}>
                                <img 
                                    src={msg.content.startsWith('http') ? msg.content : `data:image/png;base64,${msg.content}`} 
                                    style={{ display: 'block', maxWidth: '100%', borderRadius: '8px', maxHeight: '60vh' }}
                                />
                            </div>
                            <div style={{
                                paddingLeft: '0.5rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)'
                            }}
                            onClick={() => {
                                if (msg.textPrompt) setInput(msg.textPrompt);
                                if (msg.metadata?.ratio) setRatio(msg.metadata.ratio);
                                if (msg.metadata?.resolution) setResolution(msg.metadata.resolution);
                            }}
                            title="Clique para Reutilizar (Remix)">
                                <span>{msg.metadata?.ratio}</span>
                                <span> • </span>
                                <span>{msg.metadata?.resolution}</span>
                                <span> • </span>
                                <span>TEMP {msg.metadata?.temp}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))
          )}
          
          {loading && (
             <div className="shimmer-frame" style={{ width: '100%', height: '300px', maxWidth: '500px' }}></div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            padding: '2rem', 
            background: 'linear-gradient(to top, var(--bg-deep) 80%, transparent)' 
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Control Deck */}
                <ControlDeck 
                    ratio={ratio} setRatio={setRatio}
                    resolution={resolution} setResolution={setResolution}
                    smartSaveMode={smartSaveMode} setSmartSaveMode={setSmartSaveMode}
                />

                {/* Input Field */}
                <div style={{ 
                    background: 'var(--bg-input)', 
                    borderRadius: '16px', 
                    padding: '0.5rem 1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <button className="btn-clean"><Sparkles size={18} style={{ opacity: 0}} /></button> 
                    
                    <textarea 
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto'; 
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                        placeholder="Descreva sua imaginação..."
                        style={{ 
                            flex: 1, 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'white', 
                            resize: 'none', 
                            outline: 'none',
                            maxHeight: '200px',
                            padding: '10px 0',
                            overflowY: 'hidden'
                        }} 
                    />
                    
                    {loading ? (
                         <button 
                            className="btn-accent"
                            style={{ background: '#ef4444' }} // Red for stop
                            onClick={() => {
                                setLoading(false);
                            }}
                        >
                            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }}></div>
                        </button>
                    ) : (
                        <button 
                            onClick={handleGenerate}
                            disabled={!input.trim()}
                            className="btn-accent"
                            style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Sparkles size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
        
      </div>
    </div>
  );
}
