# DeadEnd AI - Round 3 report text

Report date: 14 November 2026 (IST).
Verified source candidate: d0e540e6a727060d80f4671bddd07d0853e8fa05.
This report describes a tested review candidate. It does not establish that the candidate is deployed.

## Page 1 - Remember the reason

DeadEnd AI preserves the technical approaches a team rejected, the evidence behind those decisions, and the conditions an incoming developer must recheck.

Team: NIKKUSHRIVASTAVA0.
Team lead: Nitanshu Shrivastav.
Team member: Kanishk Baghel.

Public demo: https://deadend-ai-codersinpune.vercel.app/
Team workspace: https://deadend-ai-codersinpune.vercel.app/team.html
Repository: https://github.com/nikkushrivastava0-a11y/deadend-ai

### Try the public investigation
Source-read: Open the fictional Stripe case, inspect its exact rejection quote and possible later update, correct the interpretation, approve a public finding, and download the Markdown handover. This anonymous workflow is separate from team data.

### Try a shared handover
Source-read: Create an individual handle/password account and a workspace as owner. Load the fictional example. Invite a reviewer and a recipient using separate one-use codes. Each joins from their own account in an independent browser session. The reviewer resolves disagreement and approves; the owner issues; the recipient downloads and acknowledges. The server checks workspace membership on every team action.

### Try all three synthetic roles
Observed in browser: The optional judge sandbox pre-wires owner, reviewer and recipient in one browser. Review as reviewer, issue as owner, then download and acknowledge as recipient. The sandbox is clearly labelled synthetic and expires after 15 minutes. It supplements the real-account path.

## Page 2 - Three evidence-backed workflows

### Decision revalidation
Source-read / API-tested: Owners record a dated current-constraint assessment: unknown, still-blocked or changed. Changed and still-blocked assessments require source-bound evidence. Invalid/future dates are refused. New assessments reopen review; original quotations and assessment history are retained.

### Cross-source reconciliation
Source-read / API-tested: A reviewer compares the original finding with an exact excerpt from another authorised source. Both quotations remain verbatim. A human records the outcome, rationale and next action. Unresolved disagreement blocks approval, and a resolution still requires fresh approval.

### Handover and receipt
Observed in browser / API-tested: Only approved public findings enter a versioned brief. The addressed recipient can download and acknowledge it. Duplicate issue/acknowledgement actions preserve the original record. Later review changes leave issued briefs unchanged. Browser tests verified receipt persistence after logout and login using disposable PostgreSQL.

### Evidence boundary
Source-read: An exact quotation match proves provenance, not technical truth. Revalidation and reconciliation are dated human decisions. Restricted notes remain owner-only and are excluded from public briefs. A receipt confirms delivery, not the correctness of a recommendation.

## Page 3 - Implementation and isolation

Source-read: The frontend uses vanilla HTML, CSS and JavaScript, with self-hosted assets and a bundled Three.js evidence atlas. Small screens, reduced motion and unsupported WebGL have a semantic fallback. The backend is a Node.js 22.x HTTP server reused by the Vercel adapter.

Source-read: Team storage uses dedicated Supabase PostgreSQL with private tables, RLS, a fixed capability-gated RPC and optimistic workspace revisions. A stale-write conflict asks the user to refresh before retrying. No service-role key is sent to the browser.

Source-read: Accounts use salted scrypt password hashes. Random eight-hour sessions use HttpOnly/SameSite cookies, Secure over HTTPS; session tokens are hashed in storage and revoked by logout. This is custom application authentication, not Supabase Auth.

API-tested: The synthetic sandbox rejects real workspace IDs, real account operations and unsupported imports. Its encrypted, purpose-bound capsules expire after 15 minutes. The server enforces the selected synthetic principal, and creation is rate-limited. Synthetic capsules can replay or fork their own fictional state until expiry; they are not durable multi-user storage.

Source-read / API-tested: Health reports team configuration and database reachability. Dependency failures return a friendly team-storage message. The scheduled daily health request is best effort and becomes active only after the workflow reaches the default branch. It is not an uptime or pause-prevention guarantee.

## Page 4 - Testing

### Automated regression suite
API-tested: npm run check passed 42 of 42 Node tests. Areas include import/provenance, quotation validation, restricted output, model/source failure fixtures, account/session handling, dated rechecks, optimistic revisions, reconciliation, role restrictions, recipient isolation, immutable briefs, duplicate actions, recovery after relogin, sandbox boundaries and health responses.

### Browser E2E
Observed in browser: Seven Playwright tests passed in CI Chromium against the Node server and the actual checked-in SQL gateway on disposable PostgreSQL. The suite covers registration, wrong password, workspace creation, fictional evidence, reviewer/recipient invites, invalid/reused/expired invite refusal, dated revalidation, two-source resolution, fresh approval, issuance, download, duplicate issue/acknowledgement, refresh, logout/login, persistent receipt, empty state and outsider access. Sandbox role switching and 409/503 UI fixtures are included.

### Accessibility and viewport evidence
Observed in browser: Public and team journeys passed at emulated 390x844, 768x1024 and 1440x900, plus reduced motion at 390x844. Screenshots are recorded under docs/evidence/. A complete three-role keyboard route used Tab, Enter, native select navigation and text typing, with visible-focus assertions.

Observed in browser: axe-core 4.10.3 reported zero violations on the scanned public, sign-in and owner/reviewer/recipient states. Incomplete textarea-contrast and role-label checks still require human review. Automated axe results do not establish WCAG conformance.

### Reproduce
API-tested: A fresh empty-directory clone used Node 22.23.5, npm ci, npm run check and npm start. Local /, /team.html and /api/health returned HTTP 200. Use Node 22.x, open http://localhost:3001, and follow README setup for a disposable test database before npm run verify:browser.

Observed in browser: A separate CI run exercised the existing live production public and real-account team journeys at all four emulated settings. It passed both browser tests. That hosted run used test source 1e029686242066b366243bbd15699a3e71f37c6d and does not establish that pending sandbox, health or accessibility changes are deployed.

Unverified: Candidate hosted behavior after deployment, physical-phone behaviour, screen-reader usability and real-user performance remain outstanding. A live smoke check is required after approved deployment.

## Page 5 - Scope and next development

### Improvements
Source-read: Round 3 retains the original product direction and adds dated human revalidation, explicit two-source reconciliation, shared roles/receipts, a synthetic judge sandbox, clearer feedback, database-aware health and reproducible browser/accessibility evidence.

### Current limits
Source-read: No email verification, password recovery, OAuth or MFA. Handles are application identities. Production extraction is deterministic; optional model behaviour has fixture coverage, not a verified live-model claim. Private GitHub import, membership-revocation UI and granular source grants remain planned.

Unverified: Free-tier availability has no high-availability or failover guarantee. Daily health requests do not replace backups or live checks. Physical-device QA, screen-reader review and measured user validation remain outstanding.

### Roadmap
Source-read: Priorities are verified identity and securely tested account recovery, membership controls, authorised private-repository access, incremental evidence refresh and extraction evaluation on labelled discussions.

### Team and assistance
Team: Nitanshu Shrivastav and Kanishk Baghel. AI assistance was used for implementation, tests and documentation.

### Submission
Deadline: 16 November 2026, 23:59 IST.
Hard code freeze: 16 November 2026, 15:59 IST.
The team leader reviews the live app, repository and report, then submits the official form.
