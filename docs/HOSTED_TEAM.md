# Hosted team workspace

Open `/team.html`. Create a unique lowercase handle and a password of 12–128 characters, then create a workspace. Use a password manager: email verification and password recovery are not implemented. Handles are application identities, not verified real-world names.

Owners import sources and create one-use reviewer or recipient invitations (24-hour expiry). A teammate creates their own account and joins with the code. No notification/email is sent. Reviewers can read/review public evidence, not restricted sources. Recipients see only their addressed issued briefs and can download and acknowledge them. Workspace role and membership come from the database, never client-supplied claims. The public anonymous demo remains separate.

## Storage and authentication

The Node backend uses salted scrypt passwords and random eight-hour sessions. The browser receives only an HttpOnly, SameSite=Lax cookie (Secure on HTTPS); session tokens are hashed in the database and logout revokes the stored session. Database-backed authentication attempt limits survive function cold starts. Workspace saves use an optimistic version check; a conflict returns 409 and asks the user to refresh rather than overwrite another user's work. Issued briefs retain the approved evidence snapshot and receipts are recipient-bound.

Supabase is used for durable PostgreSQL storage, **not Supabase Auth**. Private tables have RLS enabled and direct browser/anon/authenticated table privileges revoked. A small public SECURITY INVOKER RPC delegates to a private, fixed-search-path SECURITY DEFINER function. It checks a high-entropy server-only capability before every operation; no arbitrary SQL or service-role key is accepted. Node enforces role/action and source/brief visibility. The capability cannot be exposed to clients. It is an application database credential, not an end-user session.

The independent database is `deadend-ai` in Mumbai. Only that dedicated project receives this schema. No unrelated projects are used.

## Deploy

1. Apply `database/hosted-team.sql` to a new dedicated Supabase project. It is an initial schema, not an idempotent reapply script.
2. Generate a random server capability; insert only its SHA-256 digest into `deadend_private.backend_keys`. Keep the original in the hosting provider's secret manager. Do not put it in source, SQL migration history, URLs or client assets.
3. Configure server-only `DEADEND_SUPABASE_URL`, `DEADEND_SUPABASE_KEY` (publishable API key), `DEADEND_BACKEND_KEY` (the capability). A service-role key is not required.
4. Run `npm ci && npm run check`, then deploy the same Git commit. For local configuration, export the server variables or use Node 22+ with `node --env-file=.env.local server.js`; plain `npm start` does not auto-load an env file. Team API fails closed if configuration/database access is unavailable.
5. Verify using separate owner/reviewer/recipient accounts. `npm run verify:hosted` creates clearly named disposable QA accounts when the above server variables are configured. `DEADEND_TEST_URL` targets a deployed server; it must be a deployment owned by this project. Do not print passwords, cookies or environment values. The script reports only a QA prefix and workspace ID for scoped cleanup.

## Current limits

No password reset, email verification, MFA, OAuth, private GitHub token import, per-source grants beyond owner/reviewer/public visibility, automatic reminders or organisation admin console. Free-tier provider quotas and inactivity policies still apply. Only approved **public** findings can be issued; restricted material stays owner-only. A brief acknowledgement proves receipt, not the technical truth of its contents. Incoming developers still need to recheck dated constraints.
