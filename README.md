# Mello

A modern T-shirt store built with **Next.js 15**, **React 19**, **Supabase** (Postgres + Auth) and **Razorpay** payments.

## Stack
- Next.js 15 (App Router, Server Components) + React 19
- Supabase — database, auth, row-level security
- Razorpay — payments (UPI / cards)
- Tailwind CSS + Framer Motion
- TypeScript

## Getting started

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```
| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (public, safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (**secret, server only** — bypasses RLS) |
| `RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys (**secret**) |

> ⚠️ Never put the `service_role` key or `RAZORPAY_KEY_SECRET` in client code. If a secret is ever exposed, rotate it in the respective dashboard.

### 3. Set up the database
In Supabase → **SQL Editor**, run:
1. `supabase/schema.sql` — creates tables, the new-user trigger, and RLS policies.
2. `supabase/seed.sql` — inserts a few sample products.

Then, in **Authentication → Providers → Email**, disable "Confirm email" if you want users to be logged in immediately after registering (otherwise they must confirm via email first).

### 4. Make yourself an admin
After registering once, run in the SQL Editor (replace the email):
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```
Admin panel lives at `/admin`.

### 5. Run
```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Project layout
- `app/` — routes (pages + API route handlers)
- `lib/supabase/` — `client` (browser), `server` (SSR cookies), `admin` (service role)
- `lib/products-db.ts` — product reads + DB→UI mapping
- `lib/auth.ts`, `lib/admin-utils.ts`, `lib/admin-data.ts` — auth & admin helpers
- `middleware.ts` — session refresh + route guards (`/admin`, `/account`, `/orders`, `/profile`)
- `supabase/` — `schema.sql`, `seed.sql`

## Payments flow
1. Cart → `CheckoutButton` requests a Razorpay order (`/api/checkout/razorpay`).
2. The Razorpay widget collects payment.
3. On success the client posts to `/api/checkout/verify`, which **verifies the signature server-side**, creates the order, and clears the cart.
# KeycartX
