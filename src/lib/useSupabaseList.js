import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Shared across every hook instance in this browser tab, prevents two components
// (or React's development double-invoke) from both seeing an empty table and both seeding it.
const seedingInFlight = new Set();

/**
 * Generic hook for a table where each user has many rows (a "list" section).
 * Covers goals, education_courses, love_dates, love_notes, free_notes,
 * timeline_milestones, library_items, finance_txns, and similar.
 */
export function useSupabaseList(table, orderColumn = "created_at", ascending = true, seed = null) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderColumn, { ascending });

    if (error) {
      setLoading(false);
      return;
    }

    if ((data || []).length === 0 && seed && seed.length > 0 && !seedingInFlight.has(table)) {
      seedingInFlight.add(table);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData?.user?.id;
        if (user_id) {
          // Double check nothing was inserted while we were fetching the user
          const { data: recheck } = await supabase.from(table).select("id").limit(1);
          if (!recheck || recheck.length === 0) {
            const seedRows = seed.map((r) => ({ ...r, user_id }));
            const { data: inserted, error: seedError } = await supabase.from(table).insert(seedRows).select();
            if (!seedError) {
              setRows(inserted || []);
              setLoading(false);
              return;
            }
          }
        }
      } finally {
        seedingInFlight.delete(table);
      }
    }

    setRows(data || []);
    setLoading(false);
  }, [table, orderColumn, ascending]);

  useEffect(() => {
    load();
  }, [load]);

  const addRow = async (row) => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return null;
    const { data, error } = await supabase.from(table).insert({ ...row, user_id }).select().single();
    if (!error && data) setRows((r) => [...r, data]);
    return data;
  };

  const updateRow = async (id, patch) => {
    const { data, error } = await supabase.from(table).update(patch).eq("id", id).select().single();
    if (!error && data) setRows((r) => r.map((x) => (x.id === id ? data : x)));
    return data;
  };

  // Instant local update, for smooth typing/sliding before a debounced/blur save
  const updateRowLocal = (id, patch) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeRow = async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) setRows((r) => r.filter((x) => x.id !== id));
  };

  return { rows, setRows, loading, addRow, updateRow, updateRowLocal, removeRow, reload: load };
}

/**
 * Generic hook for a table where each user has exactly one row (a "singleton"),
 * keyed by user_id as the primary key. Covers savings_goal, watching, profiles.
 */
export function useSupabaseRow(table, defaults) {
  const [row, setRow] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) {
      setLoading(false);
      return;
    }
    let { data } = await supabase.from(table).select("*").eq("user_id", user_id).maybeSingle();
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from(table)
        .insert({ ...defaults, user_id })
        .select()
        .single();
      if (insertError) {
        // Another concurrent load already created the row (common in dev with StrictMode
        // double-invoking effects), just fetch what's actually there instead of failing.
        const { data: existing } = await supabase.from(table).select("*").eq("user_id", user_id).maybeSingle();
        data = existing;
      } else {
        data = inserted;
      }
    }
    if (data) setRow(data);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (patch) => {
    setRow((r) => ({ ...r, ...patch }));
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;
    await supabase.from(table).update(patch).eq("user_id", user_id);
  };

  return { row, update, loading };
}