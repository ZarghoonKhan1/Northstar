# Northstar dashboard

Member dashboard for Northstar, built with Vite and Supabase. The UI follows the
navy/gold layout of the reference member portal: a 300px sidebar with the account
balance, a home screen with quick-action cards, VIP 1–6 levels, and the member
pages Home, Starting, Records, Top Up, Withdraw, Personal Info, Bank Information,
VIP Level, Financial Statement, Terms Of Use, Member Description, About Us and Shop.

## Backend: Supabase

Everything runs on Supabase: Postgres, Auth, Storage, Edge Functions and
Realtime. Netlify is not used, and the archived Firebase code in
`_legacy_firebase/` is reference only — it is not imported and does not run.

**Live project:** `northstar` — ref `igaaobdevlfwvgpcjknv`, region `ap-south-1`
(`https://igaaobdevlfwvgpcjknv.supabase.co`). The schema, storage buckets, RLS
policies and the `admin` Edge Function are already deployed, and the first super
admin exists. `.env` holds the project URL and anon key.

**Super admin (change the password from Personal Info → Change password after
first sign-in):**

```
username: admin
email:    admin@northstar.app
password: Northstar#Admin2026
```

- **Auth** — email/password, with optional username sign-in through the
  `email_for_username` RPC.
- **Database** — `profiles`, `products`, `commissions`, `wallets`,
  `wallet_transactions`, `bids`, `buying_accounts`, `audit_logs`.
- **Storage** — `product-images` and `profile-photos` public buckets with
  role-scoped write policies. The eight starter catalog images are stored under
  `product-images/seed/` and are reattached by the catalog seed action. The
  accessory photos live under `product-images/catalog/`.
- **Catalog** — 73 products: the 8 starter items plus 65 Apple and Samsung
  accessories imported from `Apple and Samsung Accessories Price List`
  (29 Oct 2026) with US prices stored as integer cents. 17 of the accessories
  have a product photo; the rest show the "Picture not added" placeholder.
  The import is reproducible from `supabase/seed/accessories-catalog.sql`.
  Storefront cards, the featured strip and the overview tiles open an in-portal
  product dialog; only the explicit "Visit storefront" link leaves the site,
  and it still points at the storefront home page rather than a product page.
- **Edge Function** — `admin` handles privileged account, catalog, wallet,
  commission and audit operations with service-role credentials.
- **Realtime** — the client subscribes to Postgres changes for live profile,
  wallet, catalog and commission updates.

### 1. Configure the client

`.env` is already populated for the live project:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_STOREFRONT_ORIGIN=https://buy.bestbuyer.org
```

Never put the service-role key in `.env` or any `VITE_` variable: those values
are shipped to the browser.

### 2. Apply the schema

For a fresh project, run `supabase/schema.sql` in the SQL editor, or with the CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The schema creates every table, trigger, RLS policy, storage bucket, function
grant and realtime publication.

### 3. Deploy the admin Edge Function

```bash
npx supabase functions deploy admin --project-ref <project-ref>
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided
to Edge Functions automatically.

### 4. Create the first super admin

Create an account in **Authentication → Users**, then edit and run
`supabase/bootstrap-superadmin.sql` with that email. Sign in again afterwards.

Super admins can create admin accounts; admins can manage regular members.
Regular members cannot change their own role, membership level or account status.

### 5. Run the app

```bash
npm install
npm run dev
```

Restart Vite after changing `.env`.

## Supabase MCP

The hosted Supabase MCP server is registered in the global OpenCode config
(`~/.config/opencode/opencode.json`), so it is available from any project:

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "type": "remote",
        "url": "https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
      }
    }
  }
}
```

The same server is recorded in this project's `opencode.json`. It authenticates
with OAuth: in OpenCode run `/mcps`, select **supabase**, and complete the browser
sign-in. `opencode mcp list` shows `connected` once it is ready. No personal
access token needs to be stored in the repository.

## Authorization model

- RLS is enabled on every table. Members can read only their own profile, wallet,
  wallet ledger, commissions and bids; admins can read member rows.
- Profile writes from the browser are limited by a trigger that pins `email`,
  `username`, `role`, `membership_level`, `account_status` and `created_at`.
- Catalog, wallet, commission, account and audit writes go through the `admin`
  Edge Function, which verifies the caller's JWT and role before using the
  service role.
- `audit_logs` is readable only by super admins.

## Demo purchase simulator

Starting and Records are a **demo-only simulator**. It uses the pictured
Apple Lightning Digital A/V Adapter - White and the $39.99 starting price as a
reference. Sixty synthetic price variants are shown; the price increases by
$0.25 per order and is adjusted by the assigned tier (Bronze 1.00x, Silver
1.05x, Gold 1.10x, Platinum 1.15x, Diamond 1.20x, Elite 1.25x).

The simulator starts with $100.00 of sample funds, allows up to 60 simulated
orders per Pakistan calendar day, deducts each sample price, and adds the
simulated commission to a separate demo balance. Demo state is stored in browser
local storage and is not synced to Supabase. It does not place or verify retailer
orders, does not use the real wallet, and has no cash or withdrawal value.

## Wallet credits

Members can view their balance and the latest 100 ledger entries. To add funds, a
member contacts an administrator outside the app. After independently confirming
receipt, an administrator records a USD credit from the Admin page. The
`credit_wallet` SQL function writes the immutable ledger entry and updates the
balance in one transaction, and an idempotency ID prevents duplicate credits.

## Commands

- `npm run dev` — run the local development server
- `npm run build` — create a production build in `dist/`
- `npm run preview` — serve the production build locally
- `npm run db:push` — apply `supabase/migrations`/schema with the Supabase CLI
- `npm run functions:deploy` — deploy the `admin` Edge Function

## Requirements compliance

This section maps `New Text Document.txt` (the Northstar requirements) to the
implementation. Section numbers refer to that document.

### Deliberate deviations

| Document | Implementation | Why |
|---|---|---|
| §6 Netlify Database, Netlify Functions, Clerk, Netlify Blobs | Supabase Postgres, Supabase Edge Function, Supabase Auth, Supabase Storage | Supabase is the whole stack, as instructed. Netlify is not used at all; `npm run build` produces a static `dist/` that can be served by any host. |
| §6 Firebase export/reconciliation before cutover (§9.12) | Not performed | The repository contained no Firebase export (no users, products, wallets, ledger, commissions or audit data). `_legacy_firebase/` is archived code only and is not imported. |
| §4.2 “purchases” simulator for real wallet/commission data | Simulator writes only to browser storage | Read together with §5.4 and §9.8 (“must never … change a real wallet”), the simulator is demo-only. The corrupted sentence in §4.2 is treated as a dropped “demo”. |

### Document contradictions handled

The supplied document has sentences with a dropped “not” or a dropped “demo”.
Each was resolved in the direction that keeps the rest of the document
consistent:

1. §1 line 13: “must be presented as guaranteed income or as payments processed
   by the website” → read as **must not**. The UI never presents commissions or
   credits as guaranteed income or as payments.
2. §4.2 line 106: “** purchases: Provide a simulator for real wallet/commission
   data” → demo simulator only.
3. §5.4 lines 189–204: missing “Starting”, “Tier”, “demo”, “Demo”; line 204
   “include it in real balances” → demo state is kept separate and **excluded**
   from real balances and reports.
4. §9.8: “The simulator writes real wallet or commission records” → read as
   **does not**. It enforces the daily cap, balance check, confirmation and reset.
5. §10 lists items “to confirm” (rates, rounding, legacy bids, storefront domain,
   image visibility, retention, Terms). Current values are documented below and
   are configuration, not hard-coded policy.

### Section-by-section map

| Requirement | Where it lives |
|---|---|
| §1, §2 member portal, no checkout/payments/withdrawals/crypto | Withdraw page states the portal does not process payments or withdrawals; no checkout, transfer or crypto code exists. |
| §2 public information pages | `information.html`, `company.html`, linked from the signed-in sidebar. |
| §2 no public self-registration | No sign-up UI or route; accounts are created by staff through the `admin` Edge Function. |
| §3 server is the authority for roles | `profiles.role` is pinned by `protect_profile_columns()`; the Edge Function re-reads the caller's role from the database on every call. |
| §3 every protected route/endpoint enforces auth | Dashboard redirects to sign-in with `returnTo`; `admin`/`superadmin` routes re-check role on load; the Edge Function rejects missing/invalid JWTs and non-admin callers. |
| §3 members read only their own records | RLS `select` policies on `profiles`, `wallets`, `wallet_transactions`, `commissions`, `bids`; products are readable by any authenticated member. |
| §3 admins cannot grant privileges or manage privileged accounts | `createUser`/`updateUser`/`deleteUser` in the Edge Function reject role changes and privileged targets for `admin`. |
| §3 only superadmin creates admins / changes roles | `role` may only be set when the caller is `superadmin`; audited as `role.change`. |
| §3 no self-deletion | UI hides actions on your own row; server rejects `uid === caller.id` for delete and self-disable. |
| §3 last active superadmin safeguard | `countSuperAdmins()` blocks demote, disable and delete of the last active superadmin. |
| §3 admin accounts disabled before deletion | Server requires `account_status = 'disabled'` for non-user roles. |
| §3 no disable/delete with balance, reserved funds or open orders | `member_has_open_exposure(uuid)` guard in the Edge Function. |
| §3 role changes revoke sessions promptly | Role change re-issues the user record and the client refreshes its token; a role mismatch forces sign-out. Disabling a profile signs the member out live. |
| §4.1 sign-in, password reset | `login.html` + `resetPassword`; admins can also generate recovery links. |
| §4.1 protected visits return to the requested route | `?returnTo=` is carried through sign-in. |
| §4.1 no account-existence disclosure | Both unknown username and wrong password return “Incorrect username or password.” |
| §4.2 overview: completeness, tier, status, featured products, navigation | Overview panel renders all of these plus recent wallet activity. |
| §4.2 membership shown, not self-assigned | VIP panel reads the profile; `membership_level` is pinned against self-edits. |
| §4.2 catalog with approved URLs and images | Products store name, description, integer cents, `https://buy.bestbuyer.org` URLs, image path. |
| §4.2 commissions with tier, cost, rate, estimate, reference | Commission table shows the stored snapshot. |
| §4.2 wallet: available, reserved, latest 100 entries | `subscribeToWalletTransactions` limits to 100. |
| §4.2 profile: only display name, phone, photo editable | `updateOwnProfile` writes only those fields; the trigger rejects the rest. |
| §4.2 activity with empty/error states | Overview activity, wallet and commission tables all render loading, empty and error text. |
| §4.2 simulator separate from real data | Local storage only, clearly labelled DEMO. |
| §4.2 public pages reachable from signed-in nav | Sidebar links to `information.html` and `company.html`. |
| §4.3 member directory | Admin panel: identity, contact, membership, status, role, actions. |
| §4.3 create by invitation, update, recovery, delete | `createUser` returns a setup link; `sendRecovery` returns a recovery link; delete guarded by exposure/role rules. |
| §4.3 catalog validation, image type/size, URL, confirmations | Server validates fields, `https` + approved origin, 5 MiB and JPEG/PNG/WebP; delete asks for confirmation. |
| §4.3 commission record + status transitions | `recordCommission` / `updateCommissionStatus`, statuses limited to pending/approved/paid/rejected. |
| §4.3 wallet credit: reference, note, confirmation, idempotency, atomic | `credit_wallet()` (single transaction, `operation_id` unique) called by the Edge Function; UI requires reference, note and a confirmation checkbox. |
| §4.3 legacy bids read-only | Admin table is labelled “Legacy bid records” with a “Record” column reading “Historical record”; no bid actions exist. |
| §4.4 superadmin: admins, roles, audit, last-superadmin guard | Admin panel role select + Super Admin audit table. |
| §5.1 six tiers, displayed consistently | `membershipLevels` in the client, `MEMBERSHIP_LEVELS` in the Edge Function, `check` constraint in the database. |
| §5.1 server-side rates, snapshot not recomputed | `COMMISSION_RATES` in the Edge Function; `rate_percent` and `membership_level` are stored per record. |
| §5.2 provenance | `commissions.created_by` / `updated_by`. |
| §5.2 rounding rule | `Math.round(cost × rate / 100)` — nearest cent, half away from zero (documented in the function). |
| §5.2 `paid` is administrative only | Footer note on the commission panel. |
| §5.2 reject invalid amounts/tiers/statuses | Safe-integer and positivity checks; unknown tier throws; status enum. |
| §5.3 integer cents | `bigint` cents everywhere; formatting only in the client. |
| §5.3 available and reserved kept separate | `balance_cents` and `reserved_balance_cents`. |
| §5.3 browser never writes wallet/ledger | No insert/update policies on `wallets`/`wallet_transactions`; `credit_wallet` is service-role only. |
| §5.3 immutable ledger + atomic balance | Single SQL function, one transaction, no update/delete policies. |
| §5.3 idempotency replay vs conflicting reuse | Replay returns `alreadyApplied`; different user/amount with the same key raises. |
| §5.3 integer limits | Balance cap `9e15`; overflow raises instead of wrapping. |
| §5.4 simulator values | USD 100.00 start, Apple Lightning Digital A/V Adapter – White at USD 39.99, +USD 0.25 per order, tier multipliers 1.00–1.25, demo rates 0.15–0.40%. |
| §5.4 60 orders per Pakistan day, progress, insufficient funds | `currentPakistanDateKey()`, progress bar, disabled button at cap or low balance. |
| §5.4 confirmation + reset with confirmation | Confirm dialog per simulated order; reset dialog restores $100.00. |
| §5.4 validate stored demo data | `readDemoState()` rejects malformed saved data and asks for a reset. |
| §5.5 product schema | Stable UUID, name, description, `price_cents`, `product_url`, `image_path`, timestamps. |
| §5.5 server-side link validation | `approvedStorefrontOrigin()` checks protocol and origin. |
| §5.5 image formats and 5 MB | Storage bucket `file_size_limit = 5242880`, `allowed_mime_types` JPEG/PNG/WebP. |
| §5.5 write restrictions | Storage policies: product images admin-only, profile photos owner-only. |
| §5.5 blobs in storage, references in rows | `image_path` / `photo_path` only. |
| §5.6 audit on server, append-only, no secrets, superadmin only | `audit()` in the Edge Function; no insert/update/delete policies for app roles; details exclude passwords/tokens; RLS read policy requires `superadmin`. |
| §6 static build output | `npm run build` writes `dist/`; the bundle is host-agnostic (any static host, including Supabase-hosted assets or a CDN). No Netlify configuration is required. |
| §6 versioned SQL migrations | `supabase/schema.sql` plus the applied migrations `initial_schema`, `harden_functions`, `requirements_hardening`. |
| §6 secrets | Only the project URL and anon key are in `.env`; the service-role key exists only inside Supabase. |
| §7 TLS, parameterized SQL, least privilege | Supabase enforces TLS; all data access uses PostgREST/RPC parameters; `anon`/`authenticated` cannot execute `credit_wallet`, `handle_new_user` or `member_has_open_exposure`. |
| §7 CSRF / accepted origins | Bearer-JWT auth (no cookie session); the Edge Function supports an `APP_ORIGINS` allow-list. |
| §7 rate limiting | Supabase Auth applies built-in limits to sign-in and recovery requests. |
| §7 non-sensitive errors | Generic sign-in errors; server errors are returned without stack traces or secrets. |
| §8 responsive + mobile nav | Breakpoint layouts plus an operable slide-out menu. |
| §8 semantics, labels, table headers | Landmarks, `<label>`s, `scope`-style table headers, `aria-live` status regions. |
| §8 keyboard + visible focus | All controls are native buttons/inputs; `:focus-visible` outlines added globally. |
| §8 loading/success/empty/error states | `aria-live` status elements on every panel. |
| §8 confirmation, duplicate-submit prevention | Confirm dialogs on destructive actions; buttons disable while a request is in flight. |
| §8 page titles, breadcrumbs, nav state | `document.title` and breadcrumb update per panel; active nav item marked `aria-current`. |
| §9.11 automated checks | `supabase/tests/requirements.sql` verifies wallet idempotency, conflicting keys, zero credits, the open-exposure guard, audit append-only behaviour, commission snapshots, signed-out isolation and RLS ownership/protected columns. Run it in the SQL editor or with `psql -v ON_ERROR_STOP=1 -f supabase/tests/requirements.sql`; it rolls back. |

### Supabase dashboard settings (cannot be set from SQL)

These four are project configuration, not schema. Set them in the Supabase
dashboard for the `northstar` project:

1. **Authentication → Sign In / Providers → Email:** turn **Allow new users to
   sign up** off. Accounts are only created by staff through the Edge Function,
   which bypasses this switch.
2. **Authentication → URL Configuration:** set **Site URL** to the deployed
   origin and add it to **Redirect URLs** (`/**`). Reset and recovery links use
   these values.
3. **Authentication → Emails / SMTP:** add SMTP credentials so password-reset
   mail is delivered. Until then, use the admin **Send recovery** link.
4. **Authentication → Password strength:** enable **leaked password protection**
   (HaveIBeenPwned). The security advisor flags it while it is off.

Optional Edge Function secret once the domain is known:

```
APP_ORIGINS = https://<dashboard-origin>
STOREFRONT_ORIGIN = https://buy.bestbuyer.org
```

### Still open before production

- Confirm the §10 decisions (commission rates, rounding, retention, Terms of
  Use, privacy notice, legal identity).
- Decide whether legacy bid rows should be archived; they are read-only today.
- Replace the generic `https://buy.bestbuyer.org` product links with the real
  per-product URLs when the business supplies them.
- `supabase/tests/requirements.sql` is a database-level suite. There is no
  automated browser test yet; the role/permission paths were verified manually.

File name: styles.css
Language: 
/* Northstar dashboard — navy & gold theme */

:root {
  --navy: #0a1f44;
  --navy-2: #102b58;
  --navy-3: #14366d;
  --gold: #ffd700;
  --gold-soft: rgba(255, 215, 0, 0.14);
  --ink: #0a1f44;
  --body: #f4f6fa;
  --muted: #6b7c99;
  --line: rgba(10, 31, 68, 0.1);
  --white: #ffffff;
  --success: #15865c;
  --danger: #a3423c;
  --radius: 16px;
  --sidebar-width: 300px;
  --font: 'Inter', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
  --font-display: 'Poppins', 'Segoe UI', Arial, Helvetica, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body.bb-body {
  margin: 0;
  background: var(--body);
  color: #333;
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.5;
}

h1, h2, h3, h4 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink);
  line-height: 1.2;
}

p {
  margin: 0;
}

a {
  color: inherit;
}

button {
  font: inherit;
  cursor: pointer;
}

img {
  max-width: 100%;
}

/* ------------------------------------------------------------------ shell */
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--body);
}

.sidebar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  flex: 0 0 var(--sidebar-width);
  width: var(--sidebar-width);
  height: 100vh;
  overflow-y: auto;
  background: var(--navy);
  color: #fff;
  box-shadow: 4px 0 14px rgba(0, 0, 0, 0.2);
}

.sidebar-profile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 28px 22px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--navy);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.sidebar-avatar {
  width: 56px;
  height: 56px;
  font-size: 20px;
  margin-bottom: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.sidebar-name {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  color: #fff;
}

.sidebar-balance-label {
  margin-top: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8497b5;
}

.sidebar-balance {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--gold);
}

.sidebar-role {
  font-size: 12px;
  color: #8497b5;
}

.nav-list {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 22px;
  border: 0;
  border-left: 3px solid transparent;
  background: transparent;
  color: #d7e1ef;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: var(--gold);
  color: #fff;
  font-weight: 600;
}

.nav-link.active .nav-icon {
  color: var(--gold);
}

.nav-icon {
  width: 20px;
  font-size: 15px;
  text-align: center;
  color: #8497b5;
}

.nav-link-admin {
  color: var(--gold);
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 22px 24px;
}

.sidebar-signout {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.18s ease;
}

.sidebar-signout:hover {
  background: rgba(255, 255, 255, 0.1);
}

.backdrop {
  display: none;
}
