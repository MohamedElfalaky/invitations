import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Records one visit for an invitation. Called by the client-side <ViewTracker>
// beacon on the (otherwise CDN-cached) guest page, so it must never be cached.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let slug: unknown;
  try {
    ({ slug } = (await req.json()) as { slug?: unknown });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase.rpc("record_invitation_view", {
    p_slug: slug,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
