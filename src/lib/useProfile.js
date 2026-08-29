import { useState } from "react";
import { useSupabaseRow } from "./useSupabaseList";
import { supabase } from "./supabaseClient";

function resizeImageToBlob(file, maxSize = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useProfile() {
  const { row, update, loading } = useSupabaseRow("profiles", {
    name: "Naomi Opuni",
    tagline: "Focused. Growing. Becoming.",
    avatar_url: null,
    bio: "",
    date_of_birth: null,
    favorites: "",
    links: [],
    privacy_pin: null,
    locked_sections: [],
  });
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file) => {
    setUploading(true);
    try {
      const blob = await resizeImageToBlob(file);
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;
      if (!user_id) return;

      const path = `${user_id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) return;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new photo shows immediately instead of a stale cached one
      await update({ avatar_url: `${urlData.publicUrl}?t=${Date.now()}` });
    } finally {
      setUploading(false);
    }
  };

  return { profile: row, update, uploadAvatar, uploading, loading };
}