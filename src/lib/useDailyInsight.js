import { useEffect, useState } from "react";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:3001";

export function useDailyInsight(snapshot) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const cacheKey = "daily_insight_cache";
  const todayKey = new Date().toISOString().slice(0, 10);

  const fetchInsight = async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
        if (cached && cached.date === todayKey) {
          setInsight(cached.data);
          return;
        }
      } catch {}
    }

    setLoading(true);
    try {
      const res = await fetch(`${AI_API_URL}/api/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      const data = await res.json();
      setInsight(data);
      localStorage.setItem(cacheKey, JSON.stringify({ date: todayKey, data }));
    } catch (err) {
      setInsight(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { insight, loading, refresh: () => fetchInsight(true) };
}