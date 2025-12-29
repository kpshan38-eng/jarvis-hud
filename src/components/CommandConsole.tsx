import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  type: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: Date;
}

interface CommandConsoleProps {
  delay?: number;
}

const CommandConsole = ({ delay = 0 }: CommandConsoleProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'system', content: 'J.A.R.V.I.S. ONLINE - SYSTEMS OPERATIONAL', timestamp: new Date() },
    { type: 'jarvis', content: 'Good evening, boss. All systems are functioning within normal parameters. How may I assist you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTimeString = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: command, timestamp: new Date() }]);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    let response = '';
    
    // Command responses
    if (lowerCommand === 'status' || lowerCommand === 'systems') {
      response = 'All systems operational, boss. CPU at 45%, memory usage nominal, network connectivity stable. Arc reactor at full capacity.';
    } else if (lowerCommand === 'time' || lowerCommand === 'what time is it') {
      response = `Current time is ${getTimeString()}, boss. Shall I set a reminder?`;
    } else if (lowerCommand === 'weather') {
      response = 'Current conditions: Clear skies, 24°C. Optimal conditions for suit deployment if needed, boss.';
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey')) {
      response = 'Good evening, boss. I trust you are well. How may I be of service?';
    } else if (lowerCommand.includes('who are you') || lowerCommand === 'jarvis') {
      response = 'I am J.A.R.V.I.S. - Just A Rather Very Intelligent System. Created by Tony Stark to assist with various tasks and manage Stark Industries systems.';
    } else if (lowerCommand === 'help' || lowerCommand === 'commands') {
      response = 'Available commands: STATUS, TIME, WEATHER, HELP. You may also ask me anything, and I shall do my best to assist, boss.';
    } else if (lowerCommand.includes('thank')) {
      response = 'You are most welcome, boss. It is my pleasure to be of service.';
    } else if (lowerCommand.includes('goodnight') || lowerCommand.includes('goodbye')) {
      response = 'Goodnight, boss. I shall maintain watch over all systems. Rest well.';
    } else {
      const responses = [
        `Understood, boss. Processing your request: "${command}". I shall have results momentarily.`,
        `Analyzing your query, boss. The parameters you have specified are being evaluated.`,
        `Very well, boss. I am running diagnostics on your request. Shall I proceed with standard protocols?`,
        `Acknowledged, boss. I have logged your request and am cross-referencing with available data.`,
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    setIsTyping(false);
    setMessages(prev => [...prev, { type: 'jarvis', content: response, timestamp: new Date() }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
    }
  };

  return (
    <div 
      className={`jarvis-panel flex flex-col h-64 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
          Command Console
        </h3>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
          <div className="w-2 h-2 rounded-full bg-primary/80" />
          <div className="w-2 h-2 rounded-full bg-primary/40" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((msg, i) => (
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
        {isTyping && (
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
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/40 font-mono"
          />
          <button 
            type="submit"
            className="p-1.5 text-primary hover:text-primary/80 transition-colors"
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
