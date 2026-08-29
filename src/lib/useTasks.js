import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setTasks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = async (text, sub = "", time = "") => {
    if (!text.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({ text: text.trim(), sub, time, done: false, user_id })
      .select()
      .single();
    if (!error && data) setTasks((t) => [...t, data]);
  };

  const toggleTask = async (id) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const { data, error } = await supabase
      .from("tasks")
      .update({ done: !current.done })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setTasks((t) => t.map((x) => (x.id === id ? data : x)));
  };

  const removeTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks((t) => t.filter((x) => x.id !== id));
  };

  const clearCompleted = async () => {
    const doneIds = tasks.filter((t) => t.done).map((t) => t.id);
    if (doneIds.length === 0) return;
    const { error } = await supabase.from("tasks").delete().in("id", doneIds);
    if (!error) setTasks((t) => t.filter((x) => !x.done));
  };

  return { tasks, loading, addTask, toggleTask, removeTask, clearCompleted };
}