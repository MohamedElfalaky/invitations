# Digital Invitations

A single multi-tenant Next.js app that serves **unlimited** beautiful, bilingual
(Arabic-first / English) digital invitations — one deployment, one row per
invitation, each with its own shareable URL at `/i/[slug]`.

- **Arabic-first, RTL.** Instant in-page EN ⇄ AR toggle that flips the whole
  layout direction. No navigation, no refetch.
- **Generated once, served from the CDN.** Each invitation page is statically
  rendered and cached. The database is **never** queried on a per-guest visit —
  300+ guests on one invitation cost ~zero. Pages refresh on demand when an admin
  edits them.
- **Three themes** (`classic`, `modern`, `playful`), cleanly decoupled and all
  consuming the same typed `Invitation` shape. Adding a theme is trivial.
- **Admin** area (Supabase Auth) to create/edit invitations with image uploads,
  a theme picker with **live preview**, an editable unique slug, and a per-invitation
  **RSVP dashboard**.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion ·
Supabase (Postgres + Storage + Auth) · Vercel.

---

## 1. Setup

### Prerequisites
- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project

### Install

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon/public key (Settings → API) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public origin used for "copy link" (e.g. `http://localhost:3000` or your domain) |

> No service-role key is needed. Row Level Security allows public **reads** of
> invitations and public **inserts** of RSVPs; everything else requires an
> authenticated admin session.

### Database

In the Supabase Dashboard → **SQL Editor**, run the two files in order:

1. `supabase/migrations/0001_init.sql` — tables, enum, RLS policies, the
   `invitation-assets` storage bucket and its policies.
2. `supabase/seed.sql` — one demo invitation (`demo-wedding`) + sample RSVPs.

(Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db push`
then run the seed.)

### Create an admin user

Supabase Dashboard → **Authentication → Users → Add user** → set an email and
password. That account can sign in at `/admin`. Any authenticated user is an admin
and can manage every invitation.

### Run

```bash
npm run dev
```

- Public demo: <http://localhost:3000/i/demo-wedding>
- Admin: <http://localhost:3000/admin>

---

## 2. How the caching works (important)

The cost requirement is "generated once, served from the CDN, DB not queried per
guest." This is enforced in [`src/app/i/[slug]/page.tsx`](src/app/i/[slug]/page.tsx):

- `export const dynamic = "force-static"` → the page is statically rendered and
  stored in Next's **Full Route Cache** (served by the CDN on Vercel).
- The data read goes through [`getInvitationBySlug`](src/lib/invitations.ts), which
  wraps the Supabase query in `unstable_cache` tagged `invitation:<slug>`.
- Unknown slugs render on demand the first time, then cache (and so does the 404).
- When an admin **creates / edits / deletes** an invitation, the server action
  calls `revalidatePath("/i/<slug>")` + `revalidateTag("invitation:<slug>")`, so
  the page regenerates exactly once on the next request.
- Submitting an RSVP does **not** revalidate the public page (it shows no RSVP
  data) — it only refreshes the admin dashboard's cached counts.

The countdown, language toggle, gallery lightbox, music and the RSVP form are all
client components that hydrate the static HTML, so a guest visit triggers **no**
database query.

---

## 3. Adding a new theme

Themes live in [`src/themes/`](src/themes) and all consume the same
`ThemeProps` (`{ invitation: Invitation }`). To add one (e.g. `royal`):

1. **Create the component**
   `src/themes/royal/RoyalTheme.tsx` exporting a React component. Reuse the shared
   primitives ([`Countdown`](src/components/Countdown.tsx),
   [`EventDetails`](src/components/EventDetails.tsx),
   [`Gallery`](src/components/Gallery.tsx),
   [`RsvpForm`](src/components/RsvpForm.tsx)) and style/arrange them however you like.

2. **Register it** in [`src/themes/index.ts`](src/themes/index.ts):
   ```ts
   import { RoyalTheme } from "./royal/RoyalTheme";
   export const THEMES = { classic, modern, playful, royal: RoyalTheme };
   export const THEME_LABELS = { /* … */ royal: "Royal" };
   ```

3. **Allow the key** — add `"royal"` to `THEME_KEYS` in
   [`src/types/invitation.ts`](src/types/invitation.ts) and to the `theme` CHECK
   constraint in the migration (`supabase/migrations/0001_init.sql`).

The admin theme picker and live preview pick it up automatically.

---

## 4. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the three environment variables (set `NEXT_PUBLIC_SITE_URL` to your Vercel
   domain).
3. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to
   the allowed redirect URLs.
4. Deploy. Run the migration + seed against your Supabase project if you haven't.

Both Vercel and Supabase free tiers are sufficient for this app.

---

## Project structure

```
src/
  app/
    i/[slug]/            # public invitation page (static + on-demand revalidate) + 404
    (admin)/admin/       # login, dashboard, new/edit form, RSVP dashboard
    actions/             # server actions: rsvp, invitations, auth
  components/            # shared public + admin components
  i18n/                  # I18nProvider + EN/AR message catalogs
  themes/                # classic / modern / playful + registry
  lib/                   # supabase clients, data layer, mappers, slug, env
  types/invitation.ts    # the shared Invitation type used everywhere
supabase/
  migrations/0001_init.sql
  seed.sql
```

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
# invitations
