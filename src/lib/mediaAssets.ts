import { createBrowserSupabase } from "@/lib/supabase/client";

const BUCKET = "invitation-assets";

/** Images (hero / share / gallery) share one pool; audio is its own pool. */
export type AssetKind = "image" | "audio";

/** Storage folders that hold each kind of asset. */
const FOLDERS: Record<AssetKind, string[]> = {
  image: ["hero", "share", "gallery"],
  audio: ["music"],
};

export type MediaAsset = {
  /** Storage path (e.g. "hero/123-abc.jpg") — unique, used as a React key. */
  path: string;
  kind: AssetKind;
  url: string;
  label: string;
  createdAt: string;
};

/**
 * Lists every previously uploaded asset of a kind, read straight from Supabase
 * Storage so a file uploaded for one invitation can be reused in others.
 */
export async function listAssets(kind: AssetKind): Promise<MediaAsset[]> {
  const supabase = createBrowserSupabase();

  const perFolder = await Promise.all(
    FOLDERS[kind].map(async (folder) => {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;

      return (data ?? [])
        // Skip Supabase's hidden ".emptyFolderPlaceholder" and any sub-folders.
        .filter((obj) => obj.name && !obj.name.startsWith("."))
        .map((obj): MediaAsset => {
          const path = `${folder}/${obj.name}`;
          const { data: pub } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);
          return {
            path,
            kind,
            url: pub.publicUrl,
            label: obj.name,
            createdAt: obj.created_at ?? "",
          };
        });
    }),
  );

  return perFolder
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Permanently deletes a file from Storage. Note: the file may be referenced by
 * more than one invitation, so callers should confirm before deleting.
 */
export async function deleteAsset(path: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
