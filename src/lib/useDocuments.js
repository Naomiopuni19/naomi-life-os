import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setDocuments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadDocument = async (file, title, category) => {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;
      if (!user_id) return;

      const path = `${user_id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) return;

      const { data, error } = await supabase
        .from("documents")
        .insert({ title: title.trim(), category, file_path: path, file_name: file.name, user_id })
        .select()
        .single();
      if (!error && data) setDocuments((d) => [data, ...d]);
    } finally {
      setUploading(false);
    }
  };

  const viewDocument = async (filePath) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(filePath, 60);
    if (!error && data) window.open(data.signedUrl, "_blank");
  };

  const removeDocument = async (id, filePath) => {
    await supabase.storage.from("documents").remove([filePath]);
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) setDocuments((d) => d.filter((x) => x.id !== id));
  };

  return { documents, loading, uploading, uploadDocument, viewDocument, removeDocument };
}