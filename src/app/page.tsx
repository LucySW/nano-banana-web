import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

const generateId = () => Math.random().toString(36).substr(2, 9);

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
  const [smartSaveMode, setSmartSaveMode] = useState<'flat' | 'project'>('flat'); // New state
  
  useEffect(() => {
    // 1. Check Auth
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
    };
    checkUser();

    // 2. Load API Key
    const key = localStorage.getItem('romsoft_key');
    if (key) {
      setApiKey(key);
      setIsLocked(false);
    }

    // 3. Load Conversations (Eventually replace with Supabase select)
    const savedConvs = localStorage.getItem('romsoft_conversations');
    if (savedConvs) {
      const parsed = JSON.parse(savedConvs);
      setConversations(parsed);
      if (parsed.length > 0) setCurrentId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
        localStorage.setItem('romsoft_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const handleValidate = (key: string) => {
    localStorage.setItem('romsoft_key', key);
    setApiKey(key);
    setIsLocked(false);
    if (conversations.length === 0) handleNewConversation();
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "Nova Ideia",
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentId(newConv.id);
  };

  const activeConversation = conversations.find(c => c.id === currentId);

  const handleGenerate = async () => {
    if (!input.trim() || !activeConversation || !apiKey) return;

    const userMsg: Message = { id: generateId(), role: 'user', content: input };
    
    // Update local state and title
    let updatedConv = { ...activeConversation, messages: [...activeConversation.messages, userMsg] };
    if (activeConversation.messages.length === 0) {
      updatedConv.title = input.slice(0, 30) + (input.length > 30 ? "..." : "");
    }

    setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          prompt: userMsg.content,
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
            textPrompt: userMsg.content,
            metadata: {
                timestamp: new Date().toISOString(),
                ratio,
                resolution,
                temp: 0.7
            }
        };

        updatedConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg] }; // Refresh ref
        setConversations(prev => prev.map(c => c.id === currentId ? updatedConv : c));
        
        // --- SMART SAVE LOGIC (Client-Side Download) ---
        // Since we are on web, we trigger a download.
        // We can simulate the folder structure by naming convention if the user sets their browser to 'Ask where to save',
        // but typically web downloads go to default. 
        // We will respect the filename convention: NanoBanana_[Project]_[Date].png
        
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
        onSelect={setCurrentId} 
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
                                paddingLeft: '0.5rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer'
                            }}
                            onClick={() => {
                                if (msg.textPrompt) setInput(msg.textPrompt);
                                if (msg.metadata?.ratio) setRatio(msg.metadata.ratio);
                                if (msg.metadata?.resolution) setResolution(msg.metadata.resolution);
                            }}
                            title="Clique para Reutilizar (Remix)">
                                <span>{msg.metadata?.ratio}</span>
                                <span>•</span>
                                <span>{msg.metadata?.resolution}</span>
                                <span>•</span>
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
