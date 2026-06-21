"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import {
  findAssetByHash,
  hashFile,
  recordAsset,
  type AssetKind,
} from "@/lib/mediaAssets";

const BUCKET = "invitation-assets";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

/**
 * Uploads a single file to Supabase Storage (authenticated) and returns its
 * public URL via `onUploaded`. Used for hero/gallery images and music.
 *
 * Every successful upload is recorded in the shared media library so it can be
 * reused later from the asset picker. Identical files (same SHA-256) are not
 * re-uploaded — the existing asset's URL is returned instead.
 */
export function MediaUpload({
  folder,
  kind,
  accept = "image/*",
  label = "Upload",
  onUploaded,
}: {
  folder: string;
  /** Which shared pool this upload belongs to. */
  kind: AssetKind;
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

    try {
      // Dedupe: if this exact file was uploaded before, reuse it.
      const contentHash = await hashFile(file).catch(() => null);
      if (contentHash) {
        const existing = await findAssetByHash(kind, contentHash);
        if (existing) {
          onUploaded(existing.url);
          setUploading(false);
          return;
        }
      }

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
      const url = data.publicUrl;

      // Best-effort: a failed library insert shouldn't block using the upload.
      await recordAsset({ kind, url, label: file.name, contentHash }).catch(
        () => {},
      );

      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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
