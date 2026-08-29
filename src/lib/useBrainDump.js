import { useState } from "react";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3001";

export function useBrainDump() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const organize = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AI_API_URL}/api/organize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      return data;
    } catch (err) {
      setError("Couldn''t reach the AI right now, try again in a moment.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { organize, loading, error };
}