import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export const useConversation = () => {
  const { user, isAuthenticated } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setConversations(data);
    }
  }, [isAuthenticated, user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSavedMessages(
        data.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
    }
    setIsLoading(false);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title?: string) => {
    if (!isAuthenticated || !user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: title || "New Conversation" })
      .select()
      .single();

    if (!error && data) {
      setConversationId(data.id);
      setSavedMessages([]);
      await loadConversations();
      return data.id;
    }
    return null;
  }, [isAuthenticated, user, loadConversations]);

  // Save a message to current conversation
  const saveMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    if (!conversationId || !isAuthenticated) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });

    // Update conversation timestamp and title if first message
    if (role === "user" && savedMessages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await supabase
        .from("conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    setSavedMessages((prev) => [...prev, { role, content }]);
  }, [conversationId, isAuthenticated, savedMessages.length]);

  // Switch to a different conversation
  const switchConversation = useCallback(async (convId: string) => {
    setConversationId(convId);
    await loadMessages(convId);
  }, [loadMessages]);

  // Delete a conversation
  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from("conversations").delete().eq("id", convId);
    
    if (convId === conversationId) {
      setConversationId(null);
      setSavedMessages([]);
    }
    
    await loadConversations();
  }, [conversationId, loadConversations]);

  // Initialize on auth change
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    } else {
      setConversationId(null);
      setSavedMessages([]);
      setConversations([]);
    }
  }, [isAuthenticated, user, loadConversations]);

  return {
    conversationId,
    savedMessages,
    conversations,
    isLoading,
    createConversation,
    saveMessage,
    switchConversation,
    deleteConversation,
    loadConversations,
  };
};
