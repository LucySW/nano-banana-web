"use client";
import { useState, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { ZeroConfigModal } from '../components/ZeroConfigModal';
import { Sidebar } from '../components/Sidebar';
import { ControlDeck } from '../components/ControlDeck';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

const generateId = () => Math.random().toString(36).substr(2, 9); // Still useful for optimistic UI

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Settings State
  const [ratio, setRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1K");
  const [smartSaveMode, setSmartSaveMode] = useState<'flat' | 'project'>('flat');
  
  // --- LOAD PROJECTS ---
  const loadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (data) {
        // Map DB projects to Conversation type (messages loaded lazily ideally, but for now we can fetch them or init empty)
        // For simplicity now: we load just the list.
        const mapped: Conversation[] = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            messages: [], // We will load these when selected
            createdAt: p.created_at
        }));
        setConversations(mapped);
        
        // If we have projects but no current selection, select first
        if (mapped.length > 0 && !currentId) {
            handleSelectProject(mapped[0].id);
        } else if (mapped.length === 0) {
             // Create default if none? Or wait for user.
        }
    }
  };

  // --- LOAD MESSAGES (Generations) ---
  const loadMessages = async (projectId: string) => {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }); // Chronological

      if (data) {
          const mappedMsgs: Message[] = data.map((g: any) => ({
              id: g.id,
              role: g.role,
              content: g.content, // Text or Base64 (if we stored base64 in DB, note: DB size limit!)
              // NOTE: For now assume content is stored. If images are large, verify storage strategy.
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
    // 1. Check Auth & Load
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      loadProjects();
    };
    init();

    // 2. Load API Key (Local Setting)
    const key = localStorage.getItem('romsoft_key');
    if (key) {
      setApiKey(key);
      setIsLocked(false);
    }
  }, []);

  const handleSelectProject = (id: string) => {
      setCurrentId(id);
      loadMessages(id);
  };

  const handleValidate = (key: string) => {
    localStorage.setItem('romsoft_key', key);
    setApiKey(key);
    setIsLocked(false);
    if (conversations.length === 0) handleNewConversation();
  };

  // --- NEW PROJECT ---
  const handleNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    const newTitle = "Nova Ideia";
    
    // Insert into DB
    const { data, error } = await supabase
        .from('projects')
        .insert([{ user_id: user.id, title: newTitle }])
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
  };

  const activeConversation = conversations.find(c => c.id === currentId);

  const handleGenerate = async () => {
    if (!input.trim() || !activeConversation || !apiKey) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    const tempId = generateId(); // Optimistic ID
    const userMsg: Message = { id: tempId, role: 'user', content: input };
    
    // Optimistic Update
    let updatedConv = { ...activeConversation, messages: [...activeConversation.messages, userMsg] };
    
    // Update Title if first message
    let isFirst = activeConversation.messages.length === 0;
    if (isFirst) {
        const newTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
        updatedConv.title = newTitle;
        // Update DB Title
        supabase.from('projects').update({ title: newTitle }).eq('id', activeConversation.id).then();
    }

    setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
    
    // Save User Msg to DB (Async)
    supabase.from('generations').insert({
        project_id: activeConversation.id,
        role: 'user',
        content: input
    }).then();

    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          prompt: input, // use the captured input variable
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

        updatedConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg] }; // Refresh ref
        setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
        
        // Save AI Msg to DB
        // WARNING: Storing Base64 image in TEXT column is heavy. 
        // Ideally upload to Storage. But per user request "Supabase free limit", keeping it simple for now or expecting just text?
        // Actually user said "database should support it... maybe link Google Drive".
        // For now, allow Base64 in DB (it works for small scale) but warn user.
        await supabase.from('generations').insert({
            project_id: activeConversation.id,
            role: 'model',
            content: data.image, // Base64
            prompt_text: input,
            ratio,
            resolution,
            temperature: 0.7
        });

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
                                    src={`data:image/png;base64,${msg.content}`} 
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
                    {/* Paperclip Upload */}
                    <button className="btn-clean"><Sparkles size={18} style={{ opacity: 0}} /></button> {/* Spacer or implement real logic */}
                    
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
                                // Logic to abort fetch would go here (AbortController)
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
