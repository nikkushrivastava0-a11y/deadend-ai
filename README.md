# DeadEnd AI

Recover why a technical approach was rejected, check its original evidence, and pass a reviewed decision to the next developer. Built for CodersInPune 2026 by Nitanshu Shrivastav and Kanishk Baghel (team NIKKUSHRIVASTAVA0).

[Public demo](https://deadend-ai-codersinpune.vercel.app/) · [Team workspace](https://deadend-ai-codersinpune.vercel.app/team.html) · [Product PDF](https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round3.pdf)

## Quickstart

Use **Node.js 22.x** and npm. No database, API credential or environment file is needed for the local anonymous demo.

```sh
git clone https://github.com/nikkushrivastava0-a11y/deadend-ai.git
cd deadend-ai
npm ci
npm run check
npm start
```

Open **http://localhost:3001**. `npm start` builds the bundled assets before starting the server. Stop with Ctrl+C. To use another port, set `PORT` in your shell or run `node server.js --port 3002` after building.

`npm run check` builds assets, checks JavaScript syntax and runs the Node unit/API suite. Tests are local and use fixtures or temporary storage; they do not alter production workspaces. Exact results belong to their tested commit, not to every future revision. Run `git rev-parse HEAD` to identify your checkout.

## Try the anonymous demo

1. Choose **Trace the Stripe case**. The example is fictional.
2. Read the original quotation and possible later update. Edit the interpretation and save it for review.
3. Approve a public finding. Open **Handover** and download Markdown.
4. In **Findings**, record a dated recheck or compare two sources. Resolve disagreements and approve again before exporting.

Quotes remain unchanged when interpretations change. Restricted notes never enter public handovers. An import can legitimately return zero findings. Public GitHub issues/PRs and authorised pasted notes are supported; private repositories are not.

The anonymous demo is separate from team accounts. Locally, its default session state is in memory. Hosted anonymous capsules are encrypted/authenticated, kept in this tab's sessionStorage and expire after two hours from the last write. They do not grant cross-user access.

## Hosted team mode

Open **Team workspace** and create an individual handle/password account. Create a workspace as owner, load the example or import evidence, then invite a reviewer and a recipient. Each joins from their own account. Use independent browser profiles or private sessions; normal tabs share sign-in, and private tabs can share a private session too.

The owner records rechecks and issues an approved brief. A reviewer inspects public evidence, resolves disagreement and saves a review. The addressed recipient downloads and acknowledges the immutable brief. Reloading or signing in again recovers shared database state. A receipt confirms delivery, not technical correctness.

The Node backend uses custom salted-scrypt accounts and hashed, revocable eight-hour sessions with HttpOnly/SameSite cookies (Secure over HTTPS). **This is not Supabase Auth.** Roles come from current database membership. No service-role key is used or sent to the browser.

### Server configuration

Apply `database/hosted-team.sql` once to a **dedicated empty Supabase PostgreSQL project**. Provision a high-entropy server capability privately and insert only its SHA-256 hash into the private backend-key table as described in [hosted setup](docs/HOSTED_TEAM.md). Configure these values on the server; never commit or log them.

| Variable | Needed for | Purpose |
|---|---|---|
| `PORT` | Optional locally | HTTP port; default 3001 |
| `DEADEND_SUPABASE_URL` | Team mode | Dedicated project's HTTPS API origin |
| `DEADEND_SUPABASE_KEY` | Team mode | Publishable API key used by the backend RPC client |
| `DEADEND_BACKEND_KEY` | Team mode | Secret scoped capability; only its hash is stored in the database |
| `DEADEND_STATE_KEY` | Hosted anonymous capsules and sandbox | Secret encryption/authentication key; keep stable across instances |
| `OPENAI_API_KEY` | Optional extraction integration | Enables optional structured model selection; not configured on the submitted deterministic deployment |
| `DEADEND_MODEL` | Optional extraction integration | Optional model override |

With no team configuration, team endpoints fail closed and the local anonymous demo still works. The hosted team UI does not depend on the historical shared-password/disk deployment. That older option is retained for compatibility and described in historical notes, not as the current architecture.

## Judge sandbox

An optional **Start disposable judge sandbox** button demonstrates reviewer → owner → recipient in one browser. All data is fictional, the roles are pre-wired, state expires after 15 minutes, and the server enforces the selected synthetic principal. Real individual accounts remain the primary path.

The sandbox cannot import real notes, access a real workspace, invite real users or acknowledge a real brief. It creates no durable account/workspace records. Its encrypted state belongs only to this tab and can replay/fork fictional history until expiry; it is not a substitute for real multi-user persistence. Creation is rate-limited and requires the configured database limiter plus state key. See [sandbox boundary](docs/JUDGE_SANDBOX.md).

## Architecture

- **Browser:** vanilla HTML/CSS/JavaScript; self-hosted fonts and an ESBuild-bundled Three.js evidence atlas. Small screens, reduced motion and unsupported WebGL use the semantic fallback.
- **Backend:** Node HTTP server reused by the Vercel function. Exact quotation/source checks gate approval and export. Revalidation and two-source reconciliation are dated human decisions.
- **Shared storage:** private PostgreSQL tables with RLS and no direct client-table privileges. A fixed capability-gated RPC handles custom accounts, sessions, membership and optimistic workspace revisions. Conflicts require refreshing before retrying.
- **Briefs:** only approved public findings are frozen into versions. Later source/review changes do not rewrite issued briefs. The recipient identity gates receipts.

Health distinguishes team configuration, actual database reachability and public-demo availability. The optional daily workflow makes a read-only health request; free-tier services and scheduled jobs are best effort, not an uptime guarantee. See [operations and live smoke checklist](docs/OPERATIONS.md).

## Verification and evidence

```sh
npm run check
npx playwright install --with-deps chromium
# Supply an empty disposable LOCAL PostgreSQL database privately:
npm run verify:browser
```

[Browser evidence instructions](docs/evidence/README.md) explain `DEADEND_TEST_DATABASE_URL`, the test-only local RPC adapter and CI artifacts. Browser tests exercise the UI and actual checked-in SQL gateway on disposable PostgreSQL. That does not by itself verify the hosted Supabase transport. Axe results and keyboard coverage are recorded separately. Test output does not include passwords, cookies, keys or storage-state files.

Label evidence as **observed in browser**, **API-tested**, **source-read** or **unverified**. Viewports are emulated; no physical-phone testing is claimed. Historical results and commits are in [CHANGELOG.md](CHANGELOG.md), not mixed into the current setup instructions.

Current release results, exact source identities and remaining limits are recorded in [the release handoff](docs/ROUND3_RELEASE.md).

## Limitations and roadmap

- No email verification, password recovery, OAuth or MFA. Save a unique password; handles do not prove real-world identity. Single-use recovery codes remain planned until their complete lifecycle is securely implemented/tested.
- Production extraction is deterministic. Optional model handling has fixture coverage, not a verified live-model claim. Exact quote matching verifies provenance, not technical truth.
- No private GitHub import, granular per-source grants or membership-revocation UI yet. Restricted notes remain owner-only and are excluded from recipient briefs.
- Free-tier hosting/database availability can pause or fail. There is no high-availability or automatic failover guarantee.
- Physical-device QA, screen-reader usability and measured real-user validation require additional evidence. Axe automation alone does not establish WCAG conformance.

Next: verified identity/account recovery, membership controls, authorised private repository access, incremental source refresh and measured extraction quality on labelled real discussions. Existing evidence boundaries must remain intact.

## Submission

Round 3 closes **16 November 2026, 23:59 IST**. Hard code freeze is **16 November 2026, 15:59 IST**. The team leader submits once with the working project, repository, final PDF, feature list, architecture, improvements, testing and roadmap. The form is never submitted automatically.
