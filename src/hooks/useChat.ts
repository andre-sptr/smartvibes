import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load conversations
  const loadConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  }, []);

  // Load messages for current conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages((data || []).map(m => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      created_at: m.created_at,
    })));
  }, []);

  // Create new conversation
  const createConversation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Gagal membuat chat baru",
        variant: "destructive",
      });
      return null;
    }

    await loadConversations();
    return data.id;
  }, [loadConversations, toast]);

  // Send message with AI streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversationId) return;

    setIsLoading(true);

    try {
      // Save user message
      const { error: userMsgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversationId,
          role: "user",
          content,
        });

      if (userMsgError) throw userMsgError;

      // Get all messages for context
      const { data: allMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });

      const messagesForAI = (allMessages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI via edge function with streaming
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: messagesForAI }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get AI response");
      }

      let assistantContent = "";
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              // Update UI in real-time
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "assistant" && !lastMsg.id) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, content: assistantContent },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: "",
                    role: "assistant" as const,
                    content: assistantContent,
                    created_at: new Date().toISOString(),
                  },
                ];
              });
            }
          } catch (e) {
            // Incomplete JSON, will be completed in next iteration
          }
        }
      }

      // Save assistant message to database
      if (assistantContent) {
        await supabase.from("messages").insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantContent,
        });
      }

      // Reload messages from DB
      await loadMessages(currentConversationId);
      await loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengirim pesan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, loadMessages, loadConversations, toast]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus chat",
        variant: "destructive",
      });
      return;
    }

    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }

    await loadConversations();
    toast({
      title: "Berhasil",
      description: "Chat berhasil dihapus",
    });
  }, [currentConversationId, loadConversations, toast]);

  // Select conversation
  const selectConversation = useCallback(async (id: string) => {
    setCurrentConversationId(id);
    await loadMessages(id);
  }, [loadMessages]);

  // Initialize
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation,
  };
};
