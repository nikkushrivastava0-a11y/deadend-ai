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
