# Round 2 build — 10 November 2026
- Inspected supplied v0.6 source, 16-slide Round 1 proposal and project handoff. Baseline passed 10 tests.
- Replaced the static graph walkthrough with a selected-finding trace. Added full source inspection, review corrections, related reversal evidence and guarded export. Retained the existing CSS 3D architecture and Node backend.
- Added schema-constrained quote selection with exact segment checks and rule fallback. Only mock model calls were tested.
- Added Vercel adapter, encrypted browser-held sessions, and optional single-process disk snapshots and shared reviewer gate.
- Final npm run check: syntax checks and 15 passing Node tests. Covered wrong source permalink, missing quote, restricted data, correction, review, related update, export, bad URL, upstream failure, model failure, isolated sessions, snapshot tampering, separate authenticated instance and restart recovery.
- Public browser verified a 3-source, 5-finding synthetic case, later Stripe update, approval and one-item handover. A second run imported octocat/Hello-World issue 1 with 34,567 characters and zero candidates. Reload retained approval. Physical mobile not verified.
- Only team leader submits. Use the organiser's Round 2 form shared in the official WhatsApp group before 11 November 2026 at 10:00 AM IST. Public repository: https://github.com/nikkushrivastava0-a11y/deadend-ai. Form not submitted.

## Engineering pass — 10 November 2026
- Start: **14:35:03 IST**. User-requested four-hour target: **18:35:03 IST** (not a guarantee of runtime). Baseline main commit: `f0e57c57553049ea0e1e3f00e1c8ed153d75e12f`.
- Started on branch `fix/round2-evidence-ux-20261110` to protect the existing production deployment.
- Verified Vercel project `deadend-ai-codersinpune` exists and currently reports production deployment READY. Independent incognito HTTP verification remains pending.
- Selected real public evidence fixture: `https://github.com/ruuvi/com.ruuvi.station.webui/issues/501` documents an abandoned comparative chart approach and its rationale; an explicit later reconsideration is present in the issue.
- Priority next: capture the extraction result, fix real-data/related-update issues, run regression tests and mobile/desktop browser QA. No form submission authorised.

### 10 November engineering checkpoint
- Branch: `fix/round2-evidence-ux-20261110`; draft review: https://github.com/nikkushrivastava0-a11y/deadend-ai/pull/1 . Production main remains `f0e57c57553049ea0e1e3f00e1c8ed153d75e12f` and has not been replaced.
- Public evidence read through GitHub: https://github.com/ruuvi/com.ruuvi.station.webui/issues/501 — exact text documents abandoning a comparison-chart approach, then considering revisiting it. The fixture is public, not a user-private record.
- Fixed duplicate identical quotations from different comments sharing an ID, added provenance segment verification and model excerpt segment mapping. Added adjacent reconsideration leads and URL-backed update inspection.
- Added question-style lookup, a one-click synthetic Stripe case, an explicit one-click real public issue import, keyboard orbit and mobile/reduced-motion evidence grid.
- GitHub Actions succeeded on commit `46ff07e` with **18/18 tests** (including real issue #501, duplicate comments, model-fixture failure, review and session separation). Follow-up frontend commits still require fresh CI result.
- Vercel isolated preview `dpl_33Lk7bsx7NYS4Le8C9SUq1mpzQXs` reports READY. It was built from the earlier branch state, and is not the current branch head. No promotion or production alias changes have been made.
- Local static viewport inspection on supplied v0.6 HTML/CSS at 390x844, 768x1024 and 1440x900 showed no horizontal page overflow, but the older phone scene clipped cards. Candidate mobile fallback CSS was implemented and a follow-up static phone screenshot showed all five cards readable. This is browser emulation on a local snapshot, **not** verification of the newest deployed build or a physical phone.
- Browser navigation to live/preview Vercel URLs was unavailable through the available browser/network tools; direct local Chromium navigation was blocked by administrator policy. Actual live UI import and incognito checks are **still unverified**.
- Next executable steps: re-check CI on head, inspect preview build logs/files, finish submission report with verified vs candidate capabilities, and only release after judge journey is verified.

### 10 November evening — focused real-issue QA (requested window 20:48–00:48 IST)
- Start time from conversation clock: **20:48 IST, 10 Nov 2026**. Four-hour target: **00:48 IST, 11 Nov 2026**. This is a requested window, not elapsed work time.
- Confirmed production Vercel deployment READY (dpl_4u2zypMuYZUqsfxkareaB48a2bWe, domain deadend-ai-codersinpune.vercel.app) and baseline main commit f0e57c57553049ea0e1e3f00e1c8ed153d75e12f. Direct unauthenticated HTTP checks from this container were blocked; READY does not prove browser QA.
- Inspected draft PR #1; production main unchanged.
- Inspected real public GitHub issue https://github.com/tinyhumansai/openhuman/issues/867 which documents failed webview overlay approaches and reasons. Reproduced extraction gap in supplied local v0.6: only uninformative reverted sentence was found.
- Branch fix commit 637c97048f03c1cedee200a0fc30cf1950af4435 recognises failed approaches under markdown headings, preserving exact original quotations while displaying heading as context.
- Regression test commit f7154180ae776ef58362ed3842065da1c0543eff covers markdown headings, distinct comments, exact excerpts and export.
- Remaining: verify complete CI suite and preview browser; real live import is not yet proven, so do not promote based only on this log.
- Next executable task: check CI and preview, import public GitHub issue, inspect approval/handover, then merge a verified release. Form submission remains user-authorised only.

#### Evening QA checkpoint — 21:04 IST
- Reproduced old extraction behavior on an actual public issue description: the previous parser emitted the generic reverted sentence but skipped two separate 'Doesn't work' approach explanations.
- Added branch changes for markdown failed approaches and heading context; corrected a follow-up bug where the markdown heading itself was mistakenly classified as a failed finding. Current branch commits: 36238716e74934cc83e6fc251fb1d0333db8317b and regression 395618fd9b8a5b2b07ba81235183fa57a4077c1a.
- Equivalent local v0.6-derived Node harness with the same extraction patch and correction endpoint: npm run check 11/11 passed, including an HTTP import-to-approved-handover fixture with verbatim public issue excerpts and stubbed GitHub HTTP. This is NOT the complete current PR branch test suite.
- Static Chromium screenshots at 390x844, 768x1024, 1440x900 were captured using inline local HTML/CSS because browser navigation (even localhost) is blocked by the environment. No page-level horizontal overflow in the static render. The old mobile fallback visually clipped 3D cards despite no page overflow; applying the equivalent fallback already present in the draft PR produced a readable 2-column mobile node grid. This does not prove the full interactive branch was browser-tested.
- The new complete branch CI and unauthenticated deployed journey are still unverified, and the PR remains draft. Production main was not changed.
