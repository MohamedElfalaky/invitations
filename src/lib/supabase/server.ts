import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Cookie-bound Supabase client for authenticated server work: admin server
 * actions, the RSVP dashboard, and session checks. Reads/writes the auth cookies
 * so RLS sees `authenticated` for a logged-in admin.
 *
 * Note: `cookies()` is async in Next.js 15, so this factory is async too.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` can be called from a Server Component where mutating cookies
          // is not allowed. The middleware refreshes the session, so this is safe
          // to ignore.
        }
      },
    },
  });
}
