import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, LogIn, LogOut, Database } from "lucide-react";
import { useJarvisAI } from "@/hooks/useJarvisAI";
import { useVoice } from "@/hooks/useVoice";
import { useLocalCommands } from "@/hooks/useLocalCommands";
import { useAuth } from "@/hooks/useAuth";
import { useConversation } from "@/hooks/useConversation";
import { useNavigate } from "react-router-dom";

interface CommandConsoleProps {
  delay?: number;
}

interface DisplayMessage {
  type: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: Date;
}

const CommandConsole = ({ delay = 0 }: CommandConsoleProps) => {
  const { messages: aiMessages, isLoading, sendMessage, clearHistory, setMessages } = useJarvisAI();
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking, isSupported } = useVoice();
  const { executeCommand } = useLocalCommands();
  const { user, isAuthenticated, signOut } = useAuth();
  const { 
    conversationId, 
    savedMessages, 
    conversations, 
    createConversation, 
    saveMessage, 
    switchConversation, 
    deleteConversation 
  } = useConversation();
  const navigate = useNavigate();
  
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([
    { type: 'system', content: 'J.A.R.V.I.S. ONLINE - SYSTEMS OPERATIONAL', timestamp: new Date() },
    { type: 'jarvis', content: 'Good evening, boss. All systems are functioning within normal parameters. How may I assist you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  // Load saved messages when conversation changes
  useEffect(() => {
    if (savedMessages.length > 0 && conversationId) {
      const restored: DisplayMessage[] = [
        { type: 'system', content: 'MEMORY RESTORED', timestamp: new Date() },
      ];
      savedMessages.forEach((m) => {
        restored.push({
          type: m.role === 'user' ? 'user' : 'jarvis',
          content: m.content,
          timestamp: new Date(),
        });
      });
      setDisplayMessages(restored);
      setMessages(savedMessages);
      lastProcessedIndex.current = savedMessages.length - 1;
    }
  }, [savedMessages, conversationId, setMessages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // Sync AI messages to display
  useEffect(() => {
    if (aiMessages.length === 0) return;
    
    const newMessages: DisplayMessage[] = [];
    
    for (let i = lastProcessedIndex.current + 1; i < aiMessages.length; i++) {
      const msg = aiMessages[i];
      newMessages.push({
        type: msg.role === 'user' ? 'user' : 'jarvis',
        content: msg.content,
        timestamp: new Date(),
      });
    }
    
    if (newMessages.length > 0) {
      setDisplayMessages(prev => [...prev, ...newMessages]);
      lastProcessedIndex.current = aiMessages.length - 1;
      
      // Auto-speak the latest assistant message
      const lastNew = newMessages[newMessages.length - 1];
      if (lastNew.type === 'jarvis' && autoSpeak && lastNew.content && !isLoading) {
        speak(lastNew.content);
        // Save to database if authenticated
        if (isAuthenticated && conversationId) {
          saveMessage('assistant', lastNew.content);
        }
      }
    }
  }, [aiMessages, autoSpeak, speak, isLoading, isAuthenticated, conversationId, saveMessage]);

  // Update the last message if streaming
  useEffect(() => {
    if (aiMessages.length > 0 && isLoading) {
      const lastAiMsg = aiMessages[aiMessages.length - 1];
      if (lastAiMsg.role === 'assistant') {
        setDisplayMessages(prev => {
          const updated = [...prev];
          const lastDisplay = updated[updated.length - 1];
          if (lastDisplay && lastDisplay.type === 'jarvis') {
            updated[updated.length - 1] = { ...lastDisplay, content: lastAiMsg.content };
          }
          return updated;
        });
      }
    }
  }, [aiMessages, isLoading]);

  const getTimeString = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const command = input.trim();
    setInput('');
    
    // Try local command first
    const localResult = executeCommand(command);
    
    if (localResult.handled) {
      setDisplayMessages(prev => [
        ...prev,
        { type: 'user', content: command, timestamp: new Date() },
        { type: 'jarvis', content: localResult.response, timestamp: new Date() },
      ]);
      
      if (autoSpeak) {
        speak(localResult.response);
      }
      return;
    }
    
    // Create conversation if authenticated and none exists
    let activeConvId = conversationId;
    if (isAuthenticated && !activeConvId) {
      activeConvId = await createConversation(command.slice(0, 50));
    }
    
    // Save user message
    if (isAuthenticated && activeConvId) {
      saveMessage('user', command);
    }
    
    setDisplayMessages(prev => [...prev, { type: 'user', content: command, timestamp: new Date() }]);
    lastProcessedIndex.current++;
    
    await sendMessage(command);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = async () => {
    clearHistory();
    lastProcessedIndex.current = -1;
    setDisplayMessages([
      { type: 'system', content: 'CONVERSATION CLEARED', timestamp: new Date() },
      { type: 'jarvis', content: 'Memory banks cleared, boss. How may I assist you?', timestamp: new Date() },
    ]);
    
    // Start fresh conversation if authenticated
    if (isAuthenticated) {
      await createConversation();
    }
  };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await signOut();
      setDisplayMessages(prev => [
        ...prev,
        { type: 'system', content: 'USER SIGNED OUT', timestamp: new Date() },
      ]);
    } else {
      navigate('/auth');
    }
  };

  const handleLoadConversation = async (convId: string) => {
    await switchConversation(convId);
    setShowHistory(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    await deleteConversation(convId);
  };

  const handleNewConversation = async () => {
    await createConversation();
    setDisplayMessages([
      { type: 'system', content: 'NEW CONVERSATION INITIALIZED', timestamp: new Date() },
      { type: 'jarvis', content: 'Fresh memory banks online, boss. What shall we discuss?', timestamp: new Date() },
    ]);
    clearHistory();
    lastProcessedIndex.current = -1;
    setShowHistory(false);
  };

  return (
    <div 
      className={`jarvis-panel flex flex-col h-72 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-primary'} animate-pulse`} />
        <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
          Command Console
        </h3>
        {isAuthenticated && user && (
          <span className="text-[10px] text-muted-foreground ml-2">
            [{user.email?.split('@')[0]}]
          </span>
        )}
        <div className="ml-auto flex gap-2 items-center">
          {isAuthenticated && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1 rounded transition-colors ${showHistory ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              title="View saved conversations"
            >
              <Database className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={handleAuthClick}
            className={`p-1 rounded transition-colors ${isAuthenticated ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
            title={isAuthenticated ? "Sign out" : "Sign in for persistent memory"}
          >
            {isAuthenticated ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
          </button>
          {isSupported && (
            <>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-1 rounded transition-colors ${autoSpeak ? 'text-primary' : 'text-muted-foreground'}`}
                title={autoSpeak ? "Voice enabled" : "Voice disabled"}
              >
                {autoSpeak ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </button>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="text-primary animate-pulse">
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}
          <button
            onClick={handleClear}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <div className="flex gap-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500/80'}`} />
            <div className="w-2 h-2 rounded-full bg-primary/80" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
          </div>
        </div>
      </div>

      {/* Conversation History Dropdown */}
      {showHistory && isAuthenticated && (
        <div className="border-b border-border/50 p-2 bg-background/50 max-h-32 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-muted-foreground uppercase font-orbitron">Memory Banks</span>
            <button
              onClick={handleNewConversation}
              className="text-[10px] text-primary hover:underline"
            >
              + New
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 italic">No saved conversations</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all text-xs ${
                    conv.id === conversationId
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={() => handleLoadConversation(conv.id)}
                >
                  <span className="flex-1 truncate font-mono">{conv.title || "Untitled"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {displayMessages.map((msg, i) => (
          <div key={i} className="text-xs">
            <span className="text-muted-foreground/60 font-mono">
              [{msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}]
            </span>
            {msg.type === 'user' ? (
              <span className="text-secondary ml-2">BOSS: {msg.content}</span>
            ) : msg.type === 'system' ? (
              <span className="text-yellow-500/80 ml-2">[SYSTEM] {msg.content}</span>
            ) : (
              <span className="text-primary ml-2">J.A.R.V.I.S.: {msg.content}</span>
            )}
          </div>
        ))}
        {isLoading && displayMessages[displayMessages.length - 1]?.type !== 'jarvis' && (
          <div className="text-xs">
            <span className="text-muted-foreground/60 font-mono">
              [{getTimeString()}]
            </span>
            <span className="text-primary/60 ml-2">J.A.R.V.I.S.: Processing<span className="animate-pulse">...</span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/50">
        <div className="flex gap-2 items-center">
          <span className="text-primary font-mono text-sm">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Enter command..."}
            className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40 font-mono"
            disabled={isLoading}
          />
          {isSupported && (
            <button 
              type="button"
              onClick={handleMicClick}
              className={`p-1.5 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-1.5 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60" />
    </div>
  );
};

export default CommandConsole;
