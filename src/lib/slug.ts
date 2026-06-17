/** Slug helpers: turn host names into a URL-safe slug and keep it unique. */

/**
 * Produce a URL-safe slug. Keeps Latin letters/numbers and Arabic letters,
 * collapses everything else to single hyphens.
 */
export function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      // Normalize accented Latin characters to ASCII.
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      // Keep a-z, 0-9 and Arabic letter ranges; replace the rest with a space.
      .replace(/[^a-z0-9؀-ۿ]+/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      // Trim leading/trailing hyphens.
      .replace(/^-|-$/g, "")
  );
}

/** Append a short random suffix to disambiguate a taken slug. */
export function withRandomSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return slug ? `${slug}-${suffix}` : suffix;
}
