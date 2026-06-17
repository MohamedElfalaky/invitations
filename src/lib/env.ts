/** Centralized, validated access to public environment variables. */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get supabaseAnonKey() {
    // Supabase's newer projects issue a "publishable" key (sb_publishable_...);
    // older ones issue an "anon" JWT. Both are public-safe and RLS-enforced, so
    // accept either — preferring the publishable key when present.
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
  /** Public site origin, used for "copy link". Falls back to relative URLs. */
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "";
  },
};
