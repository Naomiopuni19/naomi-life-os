import { useState } from "react";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3001";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = async (items) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AI_API_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError("Couldn't get recommendations right now.");
    } finally {
      setLoading(false);
    }
  };

  return { recommendations, getRecommendations, loading, error };
}