# Round 3 pre-approval review handoff - 14 November 2026

This is the historical review snapshot. Use [ROUND3_RELEASE.md](ROUND3_RELEASE.md) for the merged, deployed and verified release status.

## Release boundary

Source-read: Main was 22803d6080e7740f28c625aa702a167c73079580 when this review resumed. The review candidate is d0e540e6a727060d80f4671bddd07d0853e8fa05 on task/01-logout-browser-regression. These are different revisions. No PR was merged or deployment requested in this resumed session. The official submission form was not submitted.

A final deployed release hash is not available yet. After reviewing the task diffs, merge in dependency order, verify the merged tree, deploy the approved release, and repeat the live smoke checks. Quote that deployed release commit in the final PDF/form. The candidate hash above identifies test evidence, not a completed production release.

## Before / after and task reports

| Task | Before | Change and files | Verification | Remaining boundary |
|---|---|---|---|---|
| 1 | Signed-in UI lacked reproducible E2E proof | Playwright runner, test RPC adapter, browser journeys and CI; PR #14. Follow-up PR #24 waits for completed logout and masks both invitation inputs in screenshots. | Observed in browser: owner/reviewer/recipient plus outsider, register/login, sample, invitations, revalidation, reconciliation, fresh approval, immutable brief, receipt/relogin and edge cases. | Candidate evidence uses actual SQL on disposable PostgreSQL; live candidate must be retested after deployment. |
| 2 | Weak mobile evidence | Public/team screenshot matrix in docs/evidence/; PR #23. PR #25 persists all 21 fresh masked screenshots and reports under docs/evidence/candidate-d0e540e/. | Observed in browser: 390x844, 768x1024, 1440x900 and reduced-motion 390x844; document-overflow assertions. | Emulation only; no physical-phone claim. Each manifest identifies its own source revision. |
| 3 | No systematic accessibility evidence | Filter label, contrast fixes, atomic announcements, axe/keyboard suite; public/index.html, public/design-system.css, public/team.html and tests/browser/accessibility.spec.js; PR #15. | Observed in browser: zero reported axe violations on candidate d0e540e; complete three-role keyboard route with visible-focus assertions. | Incomplete textarea contrast/role-label checks, screen-reader review and broader conformance remain unverified. |
| 4 | Judge setup unclear | Numbered guide, role badge, invitation copy and independent-session guidance in public/team.*; PR #16. | Source-read and observed in browser as part of team journeys. | Clipboard permission/fallback is not independently proven in every browser. |
| 5 | Multiple real accounts needed to inspect every role | Optional isolated, expiring synthetic sandbox; sandbox.js, server.js, public/team.*, tests/sandbox.test.js and browser test; PR #17. | API-tested: role/ID boundaries, expiry/tampering, rate limits and duplicate actions. Observed in browser: switch roles, approve, issue, download, acknowledge, reload and exit. | Not durable multi-user storage; encrypted fictional state can replay/fork until expiry. |
| 6 | Ambiguous save/error/empty feedback | Busy states, plain 409 message/refresh, connectivity guidance and empty-state text in public/team.*; PR #18. | Observed in browser: intentional 409/503 response fixtures retain unsaved text and offer refresh. | Fixtures are not a real provider outage. |
| 7 | Health only showed configuration | Read-only DB reachability probe, cached status and friendly outage guidance; hosted-team.js, server.js, public/app.js, public/team.*, tests/health.test.js; PR #19. | API-tested: reachable/down/unconfigured fixture responses, cache and credential redaction. | Actual candidate production endpoint remains unverified until deployment. |
| 8 | No scheduled probe | Daily Actions health workflow and operations instructions; .github/workflows/team-health.yml, docs/OPERATIONS.md; PR #20. | Source-read: daily 04:17 UTC / 09:47 IST request and least-privilege workflow. | Schedule is inactive until merged to default branch; no guarantee against pauses or outages. |
| 9 | No password recovery | Skipped optional recovery-code implementation; retained in roadmap. | Source-read: current accounts still have no recovery. | A complete auth/recovery lifecycle requires separate secure implementation and tests. |
| 10 | Contradictory current/history instructions | Current README, env table, architecture, limits and separate historical CHANGELOG.md; PR #21. | API-tested: empty-directory clone of 7e4930d, Node 22.23.5, npm ci, check 42/42, npm start and HTTP 200 for /, /team.html and /api/health. | Default-branch Quickstart describes the candidate after merge, not the current old main. |
| 11 | Old package name / runtime mismatch | deadend-ai package/lockfile identity, Node 22.x engines and .nvmrc; PR #22. | Source-read; fresh Node 22 startup and CI checks. | PDF binary has not been regenerated. |
| 12 | PDF had stale test/commit wording and internal notes | Proposed five-page text in docs/ROUND3_REPORT_TEXT_DRAFT.md. | Source-read against implementation and verified test records. | Text awaits user approval; existing public/DeadEnd_Round3.pdf remains unchanged. |

## Evidence and exact reproduction

API-tested: Node suite passed 42/42. Observed in browser: Playwright passed 7/7 on the tested candidate. axe-core 4.10.3 reported zero violations in the scanned states; incomplete checks remain documented.

Candidate CI: https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43583943908
Observed in browser: The separate hosted-browser job in run https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43583742875 passed both public and real-account team journeys at all four settings against the existing production deployment. Test source: 1e029686242066b366243bbd15699a3e71f37c6d. This does not verify pending features as deployed. Expired-invite SQL manipulation is intentionally skipped in external mode.

Previous full pass: https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43583732639

Use Node 22.x:

```sh
git clone https://github.com/nikkushrivastava0-a11y/deadend-ai.git deadend-round3-review
cd deadend-round3-review
git checkout d0e540e6a727060d80f4671bddd07d0853e8fa05
node --version
npm ci --no-audit --no-fund
npm run check
npm start
```

Open http://localhost:3001. In another terminal:

```sh
curl --fail http://localhost:3001/
curl --fail http://localhost:3001/team.html
curl --fail http://localhost:3001/api/health
```

Stop the local application before starting the Playwright server. Create an EMPTY disposable LOCAL PostgreSQL database named deadend_test_browser. Set DEADEND_TEST_DATABASE_URL privately in your shell; never paste it into logs or a PR. The Browser proof Actions workflow provisions the database automatically without production credentials.

```sh
npx playwright install --with-deps chromium
npm run verify:browser
npx playwright test tests/browser/accessibility.spec.js
npx playwright test tests/browser/sandbox.spec.js
npx playwright test tests/browser/feedback.spec.js
node --test tests/sandbox.test.js tests/health.test.js
```

The full browser command includes those individual suites; run an individual command only to reproduce a specific area. Reports and screenshots go to docs/evidence/. Test data and accounts are disposable.

## Pre-submission live smoke checklist

Perform against the approved deployed release, in fresh sessions. These are checks to perform, not assertions that they already passed.

- [ ] Public demo: load fictional Stripe case, inspect quote, edit, approve, download Markdown.
- [ ] Team: disposable sign-up, empty workspace, sample load, sign-out/sign-in.
- [ ] Sandbox: visible synthetic/expiry label; reviewer approval, owner issuance, recipient download/acknowledgement, exit.
- [ ] Invites: reviewer and recipient join from independent sessions; invalid/reused code refused.
- [ ] Revalidate and reconcile; fresh approval required before owner issues.
- [ ] Brief: download contains the exact quotations and dated decision context.
- [ ] Receipt: duplicate action preserves original; refresh and logout/login recover it.
- [ ] Outsider: cannot open another workspace's state or brief.
- [ ] Health: team configured/reachable and teamAvailable true.
- [ ] PDF link: /DeadEnd_Round3.pdf opens, has approved text and correct deployed commit/date.
- [ ] Repository link opens without sign-in; README matches released behavior.
- [ ] At 390x844 emulation, controls remain usable; repeat keyboard route and inspect axe incompletes.
- [ ] Verify actual hosting/database status close to submission.
- [ ] User/team leader submits the official form manually.

Deadline: 16 November 2026, 23:59 IST. Hard code freeze: 16 November 2026, 15:59 IST.

## Review diffs

Source-read: dependency order is #14 -> #15 -> #16 -> #17 -> #18 -> #19 -> #20 -> #21 -> #22 -> #24 -> #25 -> this documentation PR. PR #23 contains the separate original browser viewport evidence and can be reviewed separately. Review file diffs before merging or deploying. Later branch snapshots do not approve earlier PRs.

- Logout/evidence-redaction test fix: https://github.com/nikkushrivastava0-a11y/deadend-ai/pull/24/files
- Fresh complete evidence: https://github.com/nikkushrivastava0-a11y/deadend-ai/pull/25/files
- Proposed report text: docs/ROUND3_REPORT_TEXT_DRAFT.md in this PR. PDF regeneration awaits approval.
