"use client";
import { useState, useEffect } from 'react';
import { Conversation, Message } from '../types';
import { ZeroConfigModal } from '../components/ZeroConfigModal';
import { Sidebar } from '../components/Sidebar';
import { CommandCapsule } from '../components/CommandCapsule';
import { Wand2, Image, Palette, Building, Factory, User, Tv } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { uploadImageToDrive } from '../lib/drive';
import { WelcomeModal } from '../components/WelcomeModal';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Corporate Training Quick Prompts
const QUICK_PROMPTS = [
  { 
    icon: <User size={14} />, 
    text: "Personagem 3D cartoon corporativo, fundo verde, uniforme profissional, expressão amigável" 
  },
  { 
    icon: <Factory size={14} />, 
    text: "Cenário 3D de indústria moderna, ambiente limpo e organizado, iluminação realista, sem pessoas" 
  },
  { 
    icon: <Building size={14} />, 
    text: "Cenário 3D de escritório corporativo moderno, espaço central aberto, iluminação suave" 
  },
  { 
    icon: <Tv size={14} />, 
    text: "Tela de TV corporativa em ambiente 3D, layout limpo, espaço para texto e ícones" 
  },
];

// Full Template Library
const TEMPLATE_LIBRARY = {
  "Personagens (Fundo Verde)": [
    "Personagem 3D cartoon, estilo corporativo, usando uniforme da empresa, em pé, fundo verde sólido, iluminação uniforme de estúdio, pose neutra.",
    "Avatar 3D cartoon corporativo, meio corpo, uniforme profissional, fundo verde, expressão amigável, qualidade de animação para treinamento empresarial.",
    "Personagem 3D cartoon corporativo, fundo verde, olhando para a câmera, postura profissional, estilo Pixar corporativo.",
  ],
  "Personagens Gesticulando": [
    "Personagem 3D cartoon corporativo, fundo verde, gesticulando com as mãos enquanto explica, expressão didática.",
    "Avatar 3D cartoon de instrutor corporativo, uniforme da empresa, fundo verde, gesto de apontar para o lado.",
    "Personagem 3D cartoon, estilo treinamento corporativo, fundo verde, gesto de explicação com uma mão levantada.",
  ],
  "Cenários Industriais": [
    "Cenário 3D de indústria moderna, ambiente limpo e organizado, iluminação realista, sem pessoas.",
    "Interior de fábrica industrial moderna, perspectiva ampla, espaço central aberto, estilo realista.",
    "Cenário industrial corporativo, máquinas ao fundo, área central livre para composição com personagem.",
  ],
  "Escritórios Corporativos": [
    "Cenário 3D de escritório corporativo moderno, espaço central aberto, iluminação suave, sem pessoas.",
    "Ambiente corporativo moderno, layout clean, área central vazia para inserção de personagem.",
    "Cenário de empresa tecnológica, design contemporâneo, foco em espaço livre no centro.",
  ],
  "Fundos Neutros": [
    "Cenário corporativo neutro, tons claros, espaço central amplo, estilo treinamento empresarial.",
    "Background corporativo minimalista, ideal para vídeos instrutivos, sem distrações visuais.",
  ],
  "Telas Informativas": [
    "Tela de TV corporativa em ambiente 3D, layout limpo, espaço para texto e ícones, sem conteúdo.",
    "Monitor corporativo 3D ao lado esquerdo, design moderno, fundo neutro para inserir informações.",
    "Template de tela informativa corporativa, estilo treinamento, área clara para texto e gráficos.",
  ],
  "Composições": [
    "Personagem 3D cartoon corporativo em fundo verde, com espaço lateral direito para inserir TV informativa.",
    "Avatar 3D corporativo gesticulando, enquadramento com área reservada para tela de informações ao lado.",
  ],
};

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isGuest, setIsGuest] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const router = useRouter();
  
  const [ratio, setRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1K");
  const [smartSaveMode, setSmartSaveMode] = useState<'flat' | 'project'>('flat');

  useEffect(() => {
    const stored = localStorage.getItem("romsoft_api_key");
    if (stored) {
        setApiKey(stored);
    } else {
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

  const loadCloudProjects = async (userId: string) => {
    const { data } = await supabase
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

  const syncLocalToCloud = async (userId: string) => {
    const local = localStorage.getItem('romsoft_conversations');
    if (!local) return;

    try {
        const localConvs: Conversation[] = JSON.parse(local);
        if (localConvs.length === 0) return;

        setSyncing(true);
        for (const conv of localConvs) {
            const { data: projData } = await supabase
                .from('projects')
                .insert([{ user_id: userId, title: conv.title }])
                .select()
                .single();
            
            if (projData) {
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
        
        localStorage.removeItem('romsoft_conversations');
        setSyncing(false);
    } catch (e) {
        console.error("Sync failed", e);
        setSyncing(false);
    }
  };

  const loadCloudMessages = async (projectId: string) => {
      const { data } = await supabase
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
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsGuest(false);
        setUserSession(session);
        await syncLocalToCloud(session.user.id);
        const cloudProjects = await loadCloudProjects(session.user.id);
        setConversations(cloudProjects);
        if (cloudProjects.length > 0) {
            setCurrentId(cloudProjects[0].id);
            loadCloudMessages(cloudProjects[0].id);
        }
      } else {
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

    const key = localStorage.getItem('romsoft_key');
    if (key) setApiKey(key);
  }, []);

  useEffect(() => {
    if (isGuest && conversations.length > 0) {
        localStorage.setItem('romsoft_conversations', JSON.stringify(conversations));
    }
  }, [conversations, isGuest]);

  const handleSelectProject = (id: string) => {
      setCurrentId(id);
      if (!isGuest) loadCloudMessages(id);
  };

  const handleValidate = (key: string) => {
    localStorage.setItem('romsoft_key', key);
    setApiKey(key);
    setShowKeyModal(false);
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

    if (!apiKey) {
        setShowKeyModal(true);
        return;
    }
    
    let currentConv = activeConversation;
    if (!currentConv) {
         if (conversations.length === 0) {
             await handleNewConversation();
             return; 
         }
    }
    
    if (!currentConv) return;

    const tempId = generateId();
    const userMsg: Message = { id: tempId, role: 'user', content: input };
    let updatedConv = { ...currentConv, messages: [...currentConv.messages, userMsg] };
    
    let isFirst = currentConv.messages.length === 0;
    if (isFirst) {
        const newTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
        updatedConv.title = newTitle;
        if (!isGuest) {
            supabase.from('projects').update({ title: newTitle }).eq('id', currentConv.id).then();
        }
    }

    setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
    
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
            try {
                const folderName = smartSaveMode === 'project' ? updatedConv.title.replace(/[^a-z0-9 ]/gi, '').trim() : undefined;

                const driveResult = await uploadImageToDrive(
                    userSession.provider_token, 
                    data.image, 
                    `NanoBanana_${Date.now()}.png`,
                    folderName
                );
                
                await supabase.from('generations').insert({
                    project_id: currentConv.id,
                    role: 'model',
                    content: driveResult.webViewLink || data.image,
                    prompt_text: input,
                    ratio,
                    resolution,
                    temperature: 0.7
                });
                
            } catch (driveErr) {
                console.error("Drive upload failed", driveErr);
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

  const handleQuickPrompt = (text: string) => {
      setInput(text);
      setShowTemplates(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Modals */}
      {showWelcomeModal && <WelcomeModal onComplete={handleWelcomeComplete} />}
      {showKeyModal && <ZeroConfigModal onValidate={handleValidate} />}

      {/* Template Library Modal */}
      {showTemplates && (
        <div className="modal-backdrop" onClick={() => setShowTemplates(false)}>
          <div 
            className="glass-panel slide-up" 
            style={{ 
              width: '90%', 
              maxWidth: '600px', 
              maxHeight: '70vh',
              overflowY: 'auto',
              padding: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 500, 
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              📚 Biblioteca de Prompts Corporativos
            </h2>
            {Object.entries(TEMPLATE_LIBRARY).map(([category, prompts]) => (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--accent-blue)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {prompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="card"
                      style={{
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sidebar 
        conversations={conversations} 
        currentId={currentId} 
        onSelect={handleSelectProject} 
        onNew={handleNewConversation} 
        isGuest={isGuest}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Chat Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem', 
          paddingBottom: '140px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Empty State / Hero */}
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.5rem'
            }}>
              {/* Logo */}
              <img 
                src="/logo-r.png" 
                alt="Romsoft Studio AI" 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.2))'
                }} 
              />
              
              {/* Title */}
              <div>
                <h1 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 400, 
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  <span className="gradient-text">Romsoft Studio</span> AI
                </h1>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.9rem', 
                  marginTop: '0.5rem'
                }}>
                  Crie imagens para treinamentos corporativos
                </p>
              </div>

              {/* Quick Prompts */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                justifyContent: 'center',
                marginTop: '0.5rem',
                maxWidth: '600px'
              }}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="prompt-chip"
                  >
                    {prompt.icon}
                    <span style={{ 
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {prompt.text.slice(0, 40)}...
                    </span>
                  </button>
                ))}
              </div>

              {/* View All Templates Button */}
              <button 
                onClick={() => setShowTemplates(true)}
                className="btn btn-ghost"
                style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
              >
                📚 Ver todos os templates
              </button>
            </div>
          ) : (
            /* Messages */
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              {activeConversation.messages.map(msg => (
                <div 
                  key={msg.id} 
                  className="fade-in"
                  style={{ 
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1.5rem'
                  }}
                >
                  {msg.role === 'user' ? (
                    <div style={{ 
                      maxWidth: '70%',
                      padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px 16px 4px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: 1.5
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div style={{ maxWidth: '100%' }}>
                      <div className="glass-panel" style={{ 
                        padding: '4px', 
                        borderRadius: '16px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={msg.content.startsWith('http') ? msg.content : `data:image/png;base64,${msg.content}`} 
                          alt="Generated"
                          style={{ 
                            display: 'block', 
                            maxWidth: '100%',
                            maxHeight: '60vh', 
                            borderRadius: '12px' 
                          }}
                        />
                      </div>
                      {/* Metadata */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        marginTop: '0.5rem',
                        paddingLeft: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span style={{ color: 'var(--accent-blue)' }}>{msg.metadata?.ratio}</span>
                        <span>•</span>
                        <span>{msg.metadata?.resolution}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Loading Shimmer */}
          {loading && (
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div 
                className="shimmer" 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  borderRadius: '16px'
                }} 
              />
            </div>
          )}
        </div>

        {/* Command Capsule */}
        <CommandCapsule 
            prompt={input} setPrompt={setInput}
            onGenerate={handleGenerate}
            isGenerating={loading}
            ratio={ratio} setRatio={setRatio}
            resolution={resolution} setResolution={setResolution}
            smartSaveMode={smartSaveMode} setSmartSaveMode={setSmartSaveMode}
            isDriveConnected={!!(userSession?.provider_token)}
            onConnectDrive={handleConnectDrive}
            apiKey={apiKey} setApiKey={setApiKey}
        />
        
      </main>
    </div>
  );
}
