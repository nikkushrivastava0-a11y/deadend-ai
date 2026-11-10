# DeadEnd Round 2 — Deploying the current prototype

## What actually works
The current Node server serves the interactive CSS-3D frontend, publicly accessible GitHub issue/PR import, candidate extraction from exact quotations, human review, and a public-only Markdown handover. There are no external npm dependencies.

## Important limitations
- This is an anonymous **public demonstration**; it does not authenticate users. Do not import confidential data.
- Session state resides in the server's memory and is lost when it restarts or a new instance handles the request.
- Extraction is deterministic/rule-based, not an AI model. It may miss relevant decisions and cannot establish that a decision is still valid.
- Historical rejection is not a permanent rule. Review every claim against its linked source.
- GitHub API rate limits apply and only the first 100 general comments and first 100 PR review comments are ingested.
- Do not call this a production-ready secure role-based platform.

## Deployment through Render (once code is in a public GitHub repo)
1. Create a **new public** GitHub repository and push these files (not an existing unrelated repo).
2. In Render, New > Blueprint, select that repository and use `render.yaml`.
3. After deployment, open `/api/health` and ensure the result contains `ok: true`.
4. Open the live home page in an incognito window; load synthetic demo, approve a public finding, and download the handover.
5. In a second incognito window, ensure the first user's demo is not present.
6. Test importing a *real public* GitHub discussion with explicit rejected-approach language.

Avoid selecting Vercel for this unchanged Node HTTP server; it is not adapted for Vercel's stateless function architecture.

## Before submitting the Round 2 form
- Include the tested public live URL and the **public repo** link.
- Upload the updated project PDF to Drive, anyone-with-link Viewer, and test in incognito.
- Do not claim auth/RLS, durable storage, real LLM analysis, or enterprise data integration as implemented.
- List the known limitations and three deliverable Round 3 improvements.
