import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3001";

export function useChatConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    const { data } = await supabase.from("chat_conversations").select("*").order("created_at", { ascending: false });
    setConversations(data || []);
    setListLoading(false);
    return data || [];
  }, []);

  useEffect(() => {
    loadConversations().then((convos) => {
      if (convos.length > 0) setActiveId(convos[0].id);
    });
  }, [loadConversations]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }, []);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const selectConversation = (id) => {
    setActiveId(id);
  };

  const deleteConversation = async (id) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    setConversations((c) => c.filter((x) => x.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) {
      setLoading(false);
      return;
    }

    let conversationId = activeId;

    if (!conversationId) {
      const title = text.trim().slice(0, 48) + (text.trim().length > 48 ? "..." : "");
      const { data: newConvo } = await supabase
        .from("chat_conversations")
        .insert({ user_id, title })
        .select()
        .single();
      conversationId = newConvo.id;
      setActiveId(conversationId);
      setConversations((c) => [newConvo, ...c]);
    }

    const userMsg = { role: "user", content: text.trim(), conversation_id: conversationId, user_id };
    const { data: insertedUserMsg } = await supabase.from("chat_messages").insert(userMsg).select().single();
    const nextMessages = [...messages, insertedUserMsg];
    setMessages(nextMessages);

    try {
      const res = await fetch(`${AI_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.reply || "Something went wrong.", conversation_id: conversationId, user_id };
      const { data: insertedAssistantMsg } = await supabase.from("chat_messages").insert(assistantMsg).select().single();
      setMessages((m) => [...m, insertedAssistantMsg]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server just now, try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    listLoading,
    activeId,
    messages,
    loading,
    startNewChat,
    selectConversation,
    deleteConversation,
    sendMessage,
  };
}