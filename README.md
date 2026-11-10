# DeadEnd AI | CodersInPune 2026
Team NIKKUSHRIVASTAVA0 · Lead: Nitanshu Shrivastav

Live investigation workspace: https://deadend-ai-codersinpune.vercel.app/

## Try it
Open an example case, select the Stripe finding and inspect the evidence and later update. Choose Review finding, edit the interpretation, and approve or reject it. Open Handover and download the approved public lessons. Restricted examples stay out. For your own investigation, use Add evidence with a public GitHub issue or PR URL or authorised notes. An import can correctly produce zero findings.

## Run
Node 20+; no npm runtime dependencies. Run `npm start` and open http://localhost:3001. On Windows the supplied launcher starts the local server. Run `npm run check` for syntax checks and the integration/unit suite.

## Architecture and configuration
The original Node HTTP server hosts a vanilla JavaScript interface with CSS 3D perspective and pointer orbit. The Vercel function reuses that server. Desktop cards follow the selected finding. Narrow screens and reduced-motion clients use a flat grid.

GitHub issue text, conversation comments and inline PR review comments are separate evidence segments. Before approval and export, the server matches the original quote to its source and, for GitHub data, its comment permalink. An editor changes the interpretation without changing the quote. Possible changes in circumstances use named-term overlap and reversal language. Human review remains necessary.

The public Vercel deployment uses DEADEND_STATE_KEY to authenticate and encrypt a workspace held in sessionStorage. AES-256-GCM snapshots expire two hours after their last write. Rotation invalidates previous snapshots. Closing the tab can clear the case. These are individual sessions, not team storage. For a single-process local deployment, DEADEND_DATA_DIR enables atomic JSON snapshots on a persistent volume. Use a dedicated deployment behind HTTPS with DEADEND_WORKSPACE_PASSWORD to gate the Node service using HTTP Basic authentication (username reviewer). This is a shared access gate, not individual identity or role-based access control.

Optional OPENAI_API_KEY enables schema-constrained quote selection on public imports. DEADEND_MODEL overrides gpt-4o-mini. Treat imported text as untrusted. Segment index and exact quote are independently checked. Invalid candidates are discarded. Outages preserve deterministic results. Restricted notes never go to the model. Public imports may go to the configured provider; obtain permission first.

## Provenance
Round 2 extends the supplied v0.6 prototype. Engineering, design, tests and documentation used AI assistance. Sample discussions are fictional. Real issue imports are explicitly selected by URL.
