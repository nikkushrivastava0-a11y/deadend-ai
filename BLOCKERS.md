# Remaining limitations and verification requirements (10 November 2026)

## Still unimplemented by design
- No dedicated Supabase/role-aware multi-user workspace or private organisation permission system. Public demo should receive only synthetic or permissioned public data.
- No authorised production model credential; `/api/health` reported `aiConfigured:false`. Deterministic extraction works; model integration was tested only with fixtures.
- Import is bounded to sampled GitHub issue/PR/comments pages and is subject to GitHub API rate limiting and network failures.
- CSS-perspective evidence constellation is interactive, but not a Three.js/WebGL world. It includes a compact/reduced-motion fallback.

## Evidence verified during the evening release
- Exact candidate 904bb1a passed 23/23 automated Node tests in isolated Vercel Sandbox and its GitHub Action returned success.
- Public production deployment dpl_3JtwJpVKZmzzVJgdVnVGijF1em6D reported READY after merge 9ff5e302.
- Anonymous HTTP/API tests against production exercised both synthetic Stripe and real public issue #867 through import, correction, approval and evidence-linked handover. Source quotes and citations matched.

## Still to check before submission
- A real browser's click/keyboard/orbit flow on latest production at desktop, tablet and phone widths is **not independently certified**; previous 390/768/1440 static snapshots did not test all interactive behavior. Physical device and actual reduced-motion browser QA remain unverified.
- An updated Round 2 PDF is uploaded to Google Drive but currently private; set access to Anyone with link / Viewer and open in incognito before form submission.
- Exact registered full name for Kanishk remains unconfirmed; use registration records rather than guessing.
- Only the team leader may submit the Round 2 form; no submission was made automatically.

## 10 November, 21:48 IST — Browser QA update
- Earlier notes saying browser navigation was wholly blocked are historical. New isolated Vercel Sandbox with headless Chromium successfully loaded production and captured real 1440x900 and 390x844 screenshots. CSS-3D scene and keyboard orbit executed; normal paced synthetic example -> correction -> approval -> handover worked in targeted desktop and phone runs.
- **Unresolved:** rapid back-to-back click operations intermittently hit hidden/stale edit or approve buttons before asynchronous client refresh settles. One 768px tablet attempt and reduced-motion full journey were not conclusively passed. The browser sandbox timed out before completion. This is a known UX reliability risk for judges; repeat in a fresh browser and fix before claiming fully verified responsive interaction.
- A GitHub branch for a navigation-intent safeguard exists, but the attempted script update was blocked by a safety check. No UI patch was pushed; production was not altered. Do not pretend the issue is fixed.
- The Google Drive PDF remains private until the owner explicitly sets Anyone with the link / Viewer. The public Vercel PDF is verified, but the form specifically requires a public Google Drive link.

## Final release reconciliation — supersedes older QA notes
- RESOLVED: rapid-click navigation and correction-save UI issue, fixed in PR #5. Headless Chromium production journey passed four emulated viewport/motion configurations and original citation survived export. Issue #3 closed. This verification does not include a physical mobile device.
- RESOLVED: proposed security headers, merged via PR #6. Public response headers and PDF reachability verified against production. Earlier PR #4 closed as superseded.
- **Only submission-time blockers:** Google Drive uploaded PDF file is owner-private until the owner changes General access -> Anyone with the link -> Viewer; Kanishk's full registered name must be entered accurately; official Round 2 Google Form must be submitted by the team leader before 11 Nov 2026 10:00 AM IST.
- **Future product limitations (not accidental Round 2 blockers):** no live AI API credential configured; no individual role-based auth or durable shared multi-user storage; GitHub import subject to API rate limits; 3D uses CSS perspective, not Three.js/WebGL; real physical mobile/device testing not performed.

## Current Round 2 status after true WebGL release (10 Nov)
- RESOLVED: CSS-only “3D” limitation; replaced by genuine Three.js WebGL on supported desktop/tablet. Verified keyboard rail, pointer selection, extruded meshes, orbit and four browser E2E flows. The earlier contrary text in this file is historical.
- STILL PENDING future/full-product scope: ten full pages, authenticated permission-controlled private handovers, persistent multi-user database, verified live AI reasoning and physical device test. These are not represented as finished in Round 2.
- SUBMISSION-CRITICAL MANUAL ACTION: Share the NEW updated Google Drive PDF https://drive.google.com/file/d/1oVUxQMkIIPwOtjfcWu16dfS0dur9n_Yt/view with Anyone with the link / Viewer. Check the new link in a private browser, not the earlier obsolete PDF link. Confirm Kanishk's registered full name and submit the official form as team leader before the deadline.
