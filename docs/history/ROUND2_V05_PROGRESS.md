# Round 2 v0.5 — Verified changes (10 Nov 2026)

- Preserved v0.4 interface and in-memory demo workflow.
- GitHub pull requests now ingest **line-level review comments**, not just issue-style comments.
- Retain each review comment's `html_url` as the evidence permalink.
- Added mocked API regression test to exercise this import pathway.
- Added Render deployment blueprint (`render.yaml`) and deployment checklist.
- Executed `npm test`: 10 tests passed, 0 failed.

Not yet verified: live deployment, real live GitHub API import, browser visual quality, persistent storage, authentication / true permission enforcement, LLM extraction. No submitted Round 2 form.
