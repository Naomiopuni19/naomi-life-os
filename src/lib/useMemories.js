import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function resizeImageToBlob(file, maxWidth = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve({ blob, dataUrl: canvas.toDataURL("image/jpeg", 0.85) }),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useMemories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMemories(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const prepareUpload = async (file) => resizeImageToBlob(file);

  const saveMemory = async (blob, caption) => {
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) {
      setUploading(false);
      return;
    }

    const path = `${user_id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("memories").upload(path, blob, {
      contentType: "image/jpeg",
    });
    if (uploadError) {
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("memories").getPublicUrl(path);

    const { data, error } = await supabase
      .from("memories")
      .insert({ image_url: urlData.publicUrl, caption: caption.trim(), user_id })
      .select()
      .single();

    if (!error && data) setMemories((m) => [data, ...m]);
    setUploading(false);
  };

  const removeMemory = async (id) => {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (!error) setMemories((m) => m.filter((x) => x.id !== id));
  };

  return { memories, loading, uploading, prepareUpload, saveMemory, removeMemory };
}