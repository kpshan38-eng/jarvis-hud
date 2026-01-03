import { MessageSquare, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  delay?: number;
}

const ConversationHistory = ({ 
  conversations, 
  currentId, 
  onSelect, 
  onDelete, 
  onNew, 
  delay = 0 
}: ConversationHistoryProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`jarvis-panel p-3 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
            Memory Banks
          </h3>
        </div>
        <button
          onClick={onNew}
          className="p-1 text-muted-foreground hover:text-primary transition-colors"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {conversations.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 italic">No saved conversations</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-xs ${
                conv.id === currentId
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span className="flex-1 truncate font-mono">
                {conv.title || "Untitled"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                title="Delete conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
    </div>
  );
};

export default ConversationHistory;
