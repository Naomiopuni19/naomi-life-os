import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = async (text) => {
    if (!text.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ text: text.trim(), user_id })
      .select()
      .single();
    if (!error && data) setEntries((e) => [data, ...e]);
  };

  const removeEntry = async (id) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (!error) setEntries((e) => e.filter((x) => x.id !== id));
  };

  return { entries, loading, addEntry, removeEntry };
}