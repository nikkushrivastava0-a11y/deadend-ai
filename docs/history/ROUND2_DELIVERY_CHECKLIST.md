# DeadEnd / Round 2 delivery checklist

## Local verification
- [x] npm check (Node syntax + automated test suite) — rerun before submission
- [x] Source URL parsing and exact GitHub comment evidence links
- [x] Synthetic source -> review -> public-only handover API test
- [x] Per-browser temporary workspaces, rather than shared global demo
- [ ] Real external GitHub public issue/PR checked from a network-connected environment
- [ ] Visual browser QA for 3D scene across Windows/mobile

## Still required to submit
- [ ] Public GitHub repository containing these files
- [ ] Render (or equivalent persistent Node server) deployment confirmed public /api/health 200
- [ ] Working judge session tested in private browsing
- [ ] Updated Round 2 PDF with only genuinely implemented features, plus links
- [ ] One form submission from team leader

## Technical truth
- 3D scene uses CSS perspective/transform, NOT Three.js or WebGL.
- Extraction is deterministic rules, NOT OpenAI Agents SDK.
- Browser session is anonymous / in memory and resets on service restart.
- No Supabase, no durable storage, no identity-based permissions.
- Public/demo data only; NEVER upload confidential records.

## Safe Round 3 commitments (conditional)
1. Context-dependent revalidation of historical decisions.
2. Cross-source contradiction detection with human resolution.
3. Identity-based restricted handover, secure sharing and acknowledgement.
