# DeadEnd AI | CodersInPune 2026
Team NIKKUSHRIVASTAVA0 · Lead: Nitanshu Shrivastav

Live investigation workspace: https://deadend-ai-codersinpune.vercel.app/

## Try it
Open an example case, select the Stripe finding and inspect the evidence and later update. Choose Review finding, edit the interpretation, and approve or reject it. Open Handover and download the approved public lessons. Restricted examples stay out. For your own investigation, use Add evidence with a public GitHub issue or PR URL or authorised notes. An import can correctly produce zero findings.

## Run
Node 20+; no npm runtime dependencies. Run `npm start` and open http://localhost:3001. On Windows the supplied launcher starts the local server. Run `npm run check` for syntax checks and the integration/unit suite.

## Architecture and configuration
The original Node HTTP server hosts a vanilla JavaScript interface with a genuine Three.js WebGL evidence atlas and pointer/keyboard orbit. The Vercel function reuses that server. Desktop cards follow the selected finding. Narrow screens and reduced-motion clients use a flat grid.

GitHub issue text, conversation comments and inline PR review comments are separate evidence segments. Before approval and export, the server matches the original quote to its source and, for GitHub data, its comment permalink. An editor changes the interpretation without changing the quote. Possible changes in circumstances use named-term overlap and reversal language. Human review remains necessary.

The public Vercel deployment uses DEADEND_STATE_KEY to authenticate and encrypt a workspace held in sessionStorage. AES-256-GCM snapshots expire two hours after their last write. Rotation invalidates previous snapshots. Closing the tab can clear the case. These are individual sessions, not team storage. For a single-process local deployment, DEADEND_DATA_DIR enables atomic JSON snapshots on a persistent volume. Use a dedicated deployment behind HTTPS with DEADEND_WORKSPACE_PASSWORD to gate the Node service using HTTP Basic authentication (username reviewer). This is a shared access gate, not individual identity or role-based access control.

Optional OPENAI_API_KEY enables schema-constrained quote selection on public imports. DEADEND_MODEL overrides gpt-4o-mini. Treat imported text as untrusted. Segment index and exact quote are independently checked. Invalid candidates are discarded. Outages preserve deterministic results. Restricted notes never go to the model. Public imports may go to the configured provider; obtain permission first.

## Provenance
Round 2 extends the supplied v0.6 prototype. Engineering, design, tests and documentation used AI assistance. Sample discussions are fictional. Real issue imports are explicitly selected by URL.

## Verified 10 November 2026 Round 2 release
The main branch includes merged PR #1 (commit `9ff5e302`). Its predecessor release candidate `904bb1a` passed **23/23 Node tests** including real public issues #867 and #682. GitHub Actions succeeded. A new production Vercel deployment reported READY, and non-mocked GitHub import, manual review, exact citation, and anonymous handover passed in the public production HTTP API. A real interactive browser and physical mobile QA are not yet claimed.

A six-page release PDF is served at [DeadEnd_Round2.pdf](https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round2.pdf). Public sources: [openhuman#867](https://github.com/tinyhumansai/openhuman/issues/867), [CodeAtlas#682](https://github.com/codeatlasdev/ui/issues/682), [Ruuvi#501](https://github.com/ruuvi/com.ruuvi.station.webui/issues/501). Note that optional AI extraction was not live-configured.

## Final 10 November 2026 deployment — verification
The latest production release is `7fe3d2c` with frontend navigation fixes (PR #5) and HTTP security headers (PR #6). On the exact PR #6 branch, `npm run check` passed **24/24 tests** and GitHub Actions completed successfully. Vercel production reports READY. Direct public HTTP confirmed the app, health API and six-page PDF all respond with status 200; security response headers are present and API responses include no-store.

Production headless Chromium browser QA passed at **1440x900 desktop, 768x1024 tablet, 390x844 mobile, 390x844 reduced-motion mobile**: 5 interactive evidence nodes, demo, Stripe lookup, correction, approval, one-item handover, original quotation preserved and Markdown download. No horizontal overflow or page JavaScript errors were observed. These are **emulated viewport/browser checks**, not testing on a physical phone. No live OpenAI model credential or private per-user role-based storage was configured.

**Round 2 submission:** https://forms.gle/gyRiHtQT3AnC3MdV6 (team leader only; do not submit automatically). PDF: https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round2.pdf . Google Drive copy must be shared as Anyone with the link / Viewer separately by its owner.

## Genuine 3D Investigation Atlas — verified production 10 Nov 2026
- Visual release: commit `b772503`, PR #7. Real Three.js/WebGL graphics (not CSS-only simulated depth), five multilayer extruded evidence slabs, cyan/lilac lighting, animated relationship traces, mouse drag orbit, raycast selection, and compact semantic keyboard step rail. The selection is connected to actual case inspector content.
- Custom forensic-noir typography and layout use self-hosted DM Sans / Space Grotesk / Space Mono and an ESBuild-bundled Three.js module — no third-party runtime asset CDN.
- Under 700px, with reduced-motion enabled or without WebGL2, the original semantic HTML evidence grid remains fully usable; do not claim GPU 3D on phone fallback.
- Node CI `npm run check` passed **25/25**; headless Chromium production end-to-end paths passed at 1440x900, 768x1024, 390x844 and reduced-motion 390x844. All four journeys reached an approved one-item handover and downloaded Markdown without horizontal overflow or page JavaScript errors.
- This is a *four-view Round 2 MVP*, **not** the requested complete ten-page immersive product. Verified backend evidence/provenance/review preserved. Role-based private organisational sharing, durable cross-user storage, and live LLM extraction are not yet implemented.
- Updated report: https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round2.pdf . Owner-only Drive copy: https://drive.google.com/file/d/1oVUxQMkIIPwOtjfcWu16dfS0dur9n_Yt/view (needs Anyone with link → Viewer before official submission).

## Round 3 workflows (release candidate)
Dated owner rechecks, explicit two-source human reconciliation and a dedicated-server authenticated recipient handover are implemented. See [workflow setup, role matrix and limits](docs/ROUND3_WORKFLOWS.md). The anonymous public demo supports rechecks and reconciliation; shared authenticated receipts require the documented durable team server. Never treat browser capsules as cross-user permissions.

Build and check: `npm ci` then `npm run check`. Start locally with `npm start`. Local proof is not evidence that team roles are enabled in production.

## Hosted team workspaces
Open `/team.html` for individual handle/password accounts, shared PostgreSQL state, owner-controlled reviewer/recipient invitations and versioned approved briefs with recipient acknowledgement. The public demo remains separate. See [hosted setup and limits](docs/HOSTED_TEAM.md). This path uses custom scrypt accounts and HttpOnly sessions, not Supabase Auth.
