import { useState } from "react";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3001";

export function useNaomiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm here. What's on your mind?" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch(`${AI_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server just now, try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}