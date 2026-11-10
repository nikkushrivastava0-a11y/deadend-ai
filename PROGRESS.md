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

### Evening release checkpoint — 10 November 2026 (post-merge)
- Requested working window began at **20:48 IST**; four-hour target **00:48 IST, 11 Nov**. This target is not a claim of elapsed work. Continue work only while execution is active.
- Source-backed GitHub issue [tinyhumansai/openhuman#867](https://github.com/tinyhumansai/openhuman/issues/867) now yields two named failed approaches with exact source quotations. The newly created test fixture checks that the heading adds context but does not replace the evidence. Issue [codeatlasdev/ui#682](https://github.com/codeatlasdev/ui/issues/682) now preserves same-comment context for anaphoric 'We reverted it'; the original quote stays unchanged.
- Bug found and fixed during regression: a long context title truncated the named technology (Kanban). Fixed title truncation in commit `904bb1a5f9fad5af1603127ed94dcdd67f3693dc`.
- Full `npm run check` on exact candidate commit **904bb1a**: **23/23 tests passed** in isolated Vercel Sandbox, and GitHub Actions run **42847823800** finished successfully.
- Verified **real non-mocked GitHub API import** in Vercel Sandbox: #867, #682 and Ruuvi #501 imported with HTTP 200 and expected candidate evidence. Sandbox approval/correction/handover preserved exact quotes and source links.
- PR #1 merged to main as **9ff5e302e1768cb9e26a0c391c1c53b8d1c208ea**; production deployment **dpl_3JtwJpVKZmzzVJgdVnVGijF1em6D** READY on https://deadend-ai-codersinpune.vercel.app/.
- **Production HTTP judge-path test** from fresh anonymous session: / returned 200, /api/health returned 200, synthetic demo returned 5 findings, Stripe correction was approved, handover contained one corrected item with the original exact quote and no restricted evidence. A separate production session imported real public issue #867, recovered two named approaches, approved a corrected finding and generated a correctly linked handover. This is HTTP/API verification, not physical-browser navigation.
- Updated six-page Round 2 engineering report PDF created and rendered for visual inspection, with truthful shipped features, research URLs, known limitations and exactly three Round 3 commitments.
- Remaining: publish updated report PDF to the public production route and verify it, set Drive PDF to **Anyone with the link / Viewer** (new Drive file is currently private), actual mobile/desktop browser interaction test, confirm Kanishk's registered full name, and have team leader submit Google Form before 11 Nov 10:00 IST. No form submitted here.

### Browser QA checkpoint — 21:48 IST, 10 Nov
- Installed headless Chromium Playwright 1.56.1 in a disposable Vercel Sandbox. Live production navigated and screenshot captured at 1440x900 desktop and 390x844 phone emulation. Both pages loaded; neither showed page-level horizontal overflow in DOM checks. Fonts from fonts.googleapis.com were blocked by the isolated QA sandbox DNS policy; this is not evidence of a production-font outage.
- Live browser demonstrated CSS-3D evidence constellation with five clickable nodes; keyboard ArrowRight produced a changed 3D orbit transform at desktop size. This is headless Chromium desktop emulation, not a physical device.
- Browser demo loaded five synthetic findings. On fresh desktop 1440 and mobile 390 sessions with normal deliberate interaction and ~1-second settle time, editing Stripe, saving interpretation, approving and finding 1 approved handover item worked. The Markdown download event produced deadend-handover.md.
- Rapidly chained Playwright clicks sometimes targeted old/hidden review controls before asynchronous DOM refresh completed; 768-tablet and 390 reduced-motion end-to-end results remain inconclusive. A final headless test run was interrupted when the disposable Sandbox reached its execution timeout. Do NOT claim full browser-matrix completion. A targeted navigation/state race fix was drafted, but the remote code update was blocked by a safety check, so production code was NOT altered.
- Current production remains main code at merge 9ff5e302 plus PDF/docs update 6350cd3. README, form answers and report are now current; six-page PDF https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round2.pdf serves with HTTP 200, application/pdf, 15,218 bytes.
- New Drive report was uploaded to https://drive.google.com/file/d/1oU9KDX4SS6noBpLTMgjrfhN0vqbiErk2/view?usp=drivesdk; its permission was PRIVATE at verification. User must select Anyone with the link / Viewer and verify incognito before using it in the Google Form. Form not submitted.
- Next executable tasks: reproduce and fix rapid-click navigation/review sequencing in isolated branch; re-run desktop, tablet, phone and reduced-motion browser E2E; revalidate production and update this log; avoid unrelated repositories.
