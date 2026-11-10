# DeadEnd Round 2 — implementation status

Date: 2026-11-09

## Built in this version

- [x] Runnable local Node web app, dependency-free
- [x] Guided synthetic sources
- [x] Public GitHub issue/PR text connector (external live connectivity not tested here)
- [x] Manual public/restricted note import
- [x] Rule-based candidate extraction
- [x] Exact textual evidence verification
- [x] Review / dispute / reject controls
- [x] Public-only approved handover + Markdown download
- [x] Automated engine tests

## Not built / blockers

- [ ] Public GitHub repository (no DeadEnd repo visible through connected GitHub account)
- [ ] Vercel deployment with working public judge URL
- [ ] Supabase Auth + durable per-user storage + RLS
- [ ] OpenAI Agents SDK integration
- [ ] Model-assisted contradiction discovery
- [ ] End-to-end real public GitHub import test in a network-connected runtime

**Not a submission-ready production deployment yet.** Current in-memory unauthenticated server is intentionally local-only / synthetic-demo-only. Before deploying, add tenancy & permissions; until then public demo must be isolated and synthetic-only.

## How to demonstrate

1. Run `npm start` and open localhost:3000.
2. Press "Load a guided demo".
3. Open a candidate and read the exact evidence quotation.
4. Try approving the restricted note (blocked); approve a public item.
5. Go to Handover; verify only approved public items appear.
6. Download Markdown output.
7. Stop/restart server and note that state resets.
