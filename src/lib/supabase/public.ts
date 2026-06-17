import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Anonymous, cookie-less Supabase client for PUBLIC reads (invitation pages).
 *
 * This is used inside statically-rendered server components / `unstable_cache`,
 * so it must not depend on per-request cookies. RLS allows public SELECT on
 * `invitations`, so the anon key is sufficient and safe.
 */
export function createPublicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
