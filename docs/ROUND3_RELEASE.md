# DeadEnd AI - Round 3 release handoff

Verified on 14 November 2026 (IST).

Source-read: the verified application source is **c5c1d757c3beffe48c7e433ee73c28d920a83e9e**. The PDF quotes this application commit. Later report/publication commits package the evidence, add visible report links and clarify anonymous-demo copy; they do not change tested workflow or security logic. Production project: `deadend-ai-codersinpune`, Node 22.x.

Public demo: https://deadend-ai-codersinpune.vercel.app/

Team workspace and sandbox: https://deadend-ai-codersinpune.vercel.app/team.html

Product report: https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round3.pdf

## Verification results

| Evidence label | Result | Exact evidence |
|---|---|---|
| API-tested | 42/42 Node tests passed; build and syntax checks passed. | Node 22 CI on the fix/release branches; `npm run check`. |
| Observed in browser | 8/8 local Chromium tests passed with actual SQL on disposable PostgreSQL. | [Local CI](https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43587054177), source `bc9b961481b6c996d37bec9172d97540c5a8e5c5`. |
| Observed in browser | The same 8/8 tests passed against the production application, including sandbox and the delayed-response regression. | [Hosted CI](https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43587286050), test source `0e907e560f41bbe97502724bf3b654498818e8b9`. This adds CI configuration to the application source, without runtime changes. |
| Observed in browser | axe-core 4.10.3 reported zero violations across scanned public/team/role states; incomplete checks are preserved. | `docs/evidence/production-release/axe-results.json` and `axe-role-results.json`. |
| Observed in browser | Complete public and three-role team keyboard routes passed with visible-focus assertions. | `keyboard-results.json` and `keyboard-team-results.json` in the same folder. |
| Observed in browser | Public/team journeys passed at emulated 390x844, 768x1024, 1440x900 and reduced-motion 390x844. | 21 original masked hosted screenshots in `docs/evidence/production-release/`. |
| Observed in browser | Manual cloud-browser sandbox approval, issuance, download, acknowledgement and receipt restoration after reload passed. Owner textarea contrast measured 14.12:1. | `manual-browser-check.json` and `manual-sandbox-receipt.jpg`. |
| API-tested | Live `/api/health` returned HTTP 200 with configured/reachable database and `teamAvailable: true`. Served `team.js` matched verified Git blob `1e7cd77141a472c720a2c4b15aba4fab77a2a8eb`. | Point-in-time production checks; credentials and environment values were not printed. |
| API-tested | Empty-directory main clone: Node 22.23.5, `npm ci`, `npm run check` (42/42), `npm start`; local `/`, `/team.html`, `/api/health` returned 200. | Quickstart checkout `a5146cd7c78572df04ca2d4cd8d68f8c40bf8bf4`; later fix changes only sandbox UI ordering plus a browser regression. |
| Source-read / rendered artifact | Approved text was regenerated into five A4 PDF pages with embedded fonts, then rendered and inspected. Full application hash, 42 Node tests, 8 browser tests and Node 22.x are present; stale commit/internal-note wording is absent. | `public/DeadEnd_Round3.pdf`, `docs/ROUND3_REPORT_TEXT.md`, renderer and evidence manifest. |

## Before / after and files

| Task | Before | Final change and files | Verification and limits |
|---|---|---|---|
| Browser proof | Signed-in UI lacked reproducible browser evidence. | Playwright config, test-only SQL adapter, CI and `tests/browser/*`. | Observed in browser: complete owner/reviewer/recipient and outsider journeys; wrong password; invalid/reused invites; recheck/reconciliation/fresh approval; duplicate actions; download, refresh and relogin receipt. Expired-invite SQL manipulation is local-only. |
| Mobile/reduced motion | Weak viewport evidence. | 21 masked screenshots plus source/run manifests. | Observed in browser: emulated sizes only; no physical phone. |
| Accessibility | Missing filter label and low-contrast empty states. | `public/index.html`, `public/design-system.css`, team announcements and axe/keyboard tests. | Observed in browser: zero reported violations. Some contrast/role-label checks remain incomplete; no WCAG-conformance or screen-reader claim. |
| Judge guide | Account/session/role setup was unclear. | Numbered steps, visible role badge, copy control and private-profile guidance in `public/team.*`. | Source-read and observed in team journeys. Clipboard fallback is not independently proven in every browser. |
| Judge sandbox | A judge needed multiple real accounts to inspect all roles. | `sandbox.js`, server route, synthetic role controls and server/browser tests. | API-tested: role/ID isolation, tampering/expiry/rate limiting and duplicate actions. Observed in browser: complete synthetic path. Real accounts remain primary. |
| Sandbox race fix | Hosted testing found a delayed state response could undo approval. | PR #28: serialized capsule requests and inert role transitions in `public/team.js`; `sandbox-race.spec.js`. | Observed in browser: delayed-response regression and full hosted suite pass. The synthetic capsule may still intentionally replay/fork until expiry. |
| Feedback | Ambiguous save/error/empty states. | Busy status, plain 409 refresh message, connectivity/empty-state guidance. | Observed in browser: controlled 409/503 fixtures retain unsaved text. This is not a physical provider-outage test. |
| Health | Configuration was mistaken for database availability. | Read-only cached RPC probe in `hosted-team.js`, health response and friendly UI message. | API-tested: live reachable state and reachable/down/unconfigured fixtures. Real provider outage remains unverified. |
| Keep-alive | No daily probe. | `.github/workflows/team-health.yml`, operations notes. | Source-read: merged to main; daily 04:17 UTC / 09:47 IST schedule. First scheduled execution is pending. No uptime or pause-prevention guarantee. |
| README/runtime | Contradictory release history, old package name and inconsistent runtime. | Current README, archived CHANGELOG, `deadend-ai` package/lockfile, `.nvmrc`, engines and hosting Node 22.x. | Source-read and fresh-clone/API checks above. |
| PDF | Stale test/commit text, typo and internal-note wording. | Approved five-page report, final Markdown and reproducible Python renderer. | Source-read, extraction checks and rendered-page inspection. |
| Optional recovery | No recovery mechanism. | Deliberately skipped; kept on the roadmap. | Source-read: current accounts still have no password recovery or email verification. |

## Exact reproduction

Use Node 22.x:

```sh
git clone https://github.com/nikkushrivastava0-a11y/deadend-ai.git deadend-round3-review
cd deadend-round3-review
git checkout c5c1d757c3beffe48c7e433ee73c28d920a83e9e
node --version
npm ci --no-audit --no-fund
npm run check
npm start
```

Open http://localhost:3001. Stop the local app before starting the browser suite. Create an empty disposable LOCAL PostgreSQL database named `deadend_test_browser` and set `DEADEND_TEST_DATABASE_URL` privately; do not print it. The Browser proof CI workflow provisions that database automatically.

```sh
npx playwright install --with-deps chromium
npm run verify:browser
npx playwright test tests/browser/accessibility.spec.js
npx playwright test tests/browser/sandbox.spec.js tests/browser/sandbox-race.spec.js
npx playwright test tests/browser/feedback.spec.js
node --test tests/sandbox.test.js tests/health.test.js
```

The full browser command already includes the individual suites. Run an individual command to reproduce a particular area, rather than repeating all verification unnecessarily.

Source-read: the merged `Release browser smoke` workflow can be run manually from GitHub Actions. It targets only the fixed production URL, serializes runs and uses disposable accounts/synthetic workspaces. It does not manipulate production invite-expiry records.

To reproduce the PDF, use the final main checkout containing the renderer:

```sh
python -m pip install reportlab==4.4.9
python scripts/build-round3-report.py --source c5c1d757c3beffe48c7e433ee73c28d920a83e9e --hosted-run https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43587286050
```

## Live smoke checks and submission

Observed in browser / API-tested on the verification date:

- [x] Public demo: fictional sample, correction, approval and Markdown download.
- [x] Disposable team sign-up, empty workspace and sample load.
- [x] Independent reviewer/recipient sessions, invites and role restrictions.
- [x] Dated recheck, two-source resolution and mandatory fresh approval.
- [x] Brief issuance/download; duplicate actions preserve the original.
- [x] Recipient receipt survives refresh and logout/login.
- [x] Outsider cannot access another workspace's data.
- [x] Synthetic sandbox role switch, approval, issue, download, acknowledgement and reload.
- [x] Live health reports reachable database and available team mode.

Repeat the public/team/sandbox/brief/receipt checks close to submission. Also open the final `/DeadEnd_Round3.pdf` and repository link without signing in and confirm the report/source identity.

Unverified or skipped: physical-phone QA, screen-reader usability, incomplete axe items, clipboard permissions across every browser, an actual provider outage, email verification, recovery codes, live-model quality and measured real-user performance. Extraction remains deterministic. Free-tier service availability can change.

Source-read: no hackathon form was submitted. The team leader submits manually. Deadline: **16 November 2026, 23:59 IST**. Hard code freeze: **16 November 2026, 15:59 IST**.
