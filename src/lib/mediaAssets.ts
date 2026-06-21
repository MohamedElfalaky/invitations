import { createBrowserSupabase } from "@/lib/supabase/client";

/** Images (hero / share / gallery) share one pool; audio is its own pool. */
export type AssetKind = "image" | "audio";

export type MediaAsset = {
  id: string;
  kind: AssetKind;
  url: string;
  label: string;
  contentHash: string | null;
  createdAt: string;
};

type MediaAssetRow = {
  id: string;
  kind: AssetKind;
  url: string;
  label: string;
  content_hash: string | null;
  created_at: string;
};

function mapAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    label: row.label,
    contentHash: row.content_hash,
    createdAt: row.created_at,
  };
}

/** SHA-256 hex digest of a file's contents, used to dedupe re-uploads. */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** All shared assets of a kind, newest first. */
export async function listAssets(kind: AssetKind): Promise<MediaAsset[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, kind, url, label, content_hash, created_at")
    .eq("kind", kind)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAsset);
}

/** Find an already-uploaded asset with the same contents, if any. */
export async function findAssetByHash(
  kind: AssetKind,
  contentHash: string,
): Promise<MediaAsset | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, kind, url, label, content_hash, created_at")
    .eq("kind", kind)
    .eq("content_hash", contentHash)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAsset(data) : null;
}

/**
 * Record a freshly uploaded file in the shared library. Uses upsert on `url`
 * so the same URL is never recorded twice.
 */
export async function recordAsset(input: {
  kind: AssetKind;
  url: string;
  label: string;
  contentHash?: string | null;
}): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("media_assets").upsert(
    {
      kind: input.kind,
      url: input.url,
      label: input.label,
      content_hash: input.contentHash ?? null,
    },
    { onConflict: "url" },
  );
  if (error) throw error;
}

/** Remove an asset from the library (does not delete the stored file). */
export async function deleteAsset(id: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw error;
}
