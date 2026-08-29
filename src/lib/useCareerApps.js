import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const SEED_APPS = [
  { org: "Huawei Ghana", status: "interview", note: "Infoshop, aptitude and extended interview attended" },
  { org: "Parliament of Ghana, IT Division", status: "pursuing", note: "Speaker's office requested details, via IGP's son and SRC president" },
  { org: "Halliburton", status: "interview", note: "Interview attended via Career Services" },
  { org: "Absa", status: "assessment", note: "Psychometric completed" },
  { org: "Zenith Bank", status: "assessment", note: "Aptitude test attended" },
  { org: "AmaliTech", status: "assessment", note: "CodeSignal completed" },
  { org: "Integra Limited", status: "applied", note: "GitHub submission sent" },
  { org: "Arch Holdings", status: "rejected", note: "Rejected post interview" },
  { org: "GIZ", status: "applied", note: "" },
  { org: "KPMG", status: "applied", note: "" },
  { org: "EY, Assurance and Consulting", status: "applied", note: "" },
  { org: "GCB", status: "applied", note: "" },
  { org: "Stanbic", status: "applied", note: "" },
];

export function useCareerApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("career_apps")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setLoading(false);
      return;
    }

    if ((data || []).length === 0) {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;
      if (user_id) {
        const seedRows = SEED_APPS.map((a) => ({ ...a, user_id }));
        const { data: inserted, error: seedError } = await supabase
          .from("career_apps")
          .insert(seedRows)
          .select();
        if (!seedError) {
          setApps(inserted || []);
          setLoading(false);
          return;
        }
      }
    }

    setApps(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addApp = async (org, note = "") => {
    if (!org.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;
    const { data, error } = await supabase
      .from("career_apps")
      .insert({ org: org.trim(), status: "researching", note: note.trim(), user_id })
      .select()
      .single();
    if (!error && data) setApps((a) => [data, ...a]);
  };

  const setStatus = async (id, status) => {
    const { data, error } = await supabase
      .from("career_apps")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setApps((a) => a.map((x) => (x.id === id ? data : x)));
  };

  const setNoteLocal = (id, note) => {
    setApps((a) => a.map((x) => (x.id === id ? { ...x, note } : x)));
  };

  const saveNote = async (id, note) => {
    await supabase.from("career_apps").update({ note }).eq("id", id);
  };

  const removeApp = async (id) => {
    const { error } = await supabase.from("career_apps").delete().eq("id", id);
    if (!error) setApps((a) => a.filter((x) => x.id !== id));
  };

  return { apps, loading, addApp, setStatus, setNoteLocal, saveNote, removeApp };
}