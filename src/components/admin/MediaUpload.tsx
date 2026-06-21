"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

const BUCKET = "invitation-assets";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

/**
 * Uploads a single file to Supabase Storage (authenticated) and returns its
 * public URL via `onUploaded`. Used for hero/gallery/share images and music.
 *
 * The file lives in the shared `invitation-assets` bucket, so once uploaded it
 * can be reused across invitations via the AssetPicker (which lists the bucket).
 */
export function MediaUpload({
  folder,
  accept = "image/*",
  label = "Upload",
  onUploaded,
}: {
  folder: string;
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createBrowserSupabase();
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${safeName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
        {uploading ? "Uploading…" : label}
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
