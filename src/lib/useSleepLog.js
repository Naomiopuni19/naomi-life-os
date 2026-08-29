import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSleepLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("sleep_log")
      .select("*")
      .order("wake_at", { ascending: false })
      .limit(30);
    if (!error) setLogs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addLog = async (entry) => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;
    const { error } = await supabase.from("sleep_log").insert({ ...entry, user_id });
    if (!error) await load();
  };

  return { logs, loading, addLog };
}

function fmtDuration(hoursDecimal) {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  return `${h}h ${m}m`;
}

export function deriveSleepSummary(logs) {
  if (!logs || logs.length === 0) {
    return { bed: "--", wake: "--", total: "--", week: [] };
  }
  const last = logs[0];
  const last7 = logs.slice(0, 7).slice().reverse();
  return {
    bed: new Date(last.bed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    wake: new Date(last.wake_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    total: fmtDuration(Number(last.hours)),
    week: last7.map((l) => Number(l.hours)),
  };
}