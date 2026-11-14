# Submission operations

Deadline: 16 November 2026, 23:59 IST (18:29 UTC). Hard code freeze: 16 November 2026, 15:59 IST (10:29 UTC). After freeze, use the smoke checklist and report blockers; do not introduce risky code.

## Daily health

The `Daily team health` GitHub Actions workflow calls the public health endpoint at 04:17 UTC daily. The database-aware health implementation must be released first; the old endpoint only reports configuration. The new probe makes a read-only query through the same RPC path as team requests. It exposes booleans and a check time, never credentials. No paid service is required.

Scheduled Actions run only after the workflow exists on the default branch. Scheduling is best effort: jobs can be delayed or disabled, and neither a daily request nor free-tier hosting guarantees uptime or prevents every pause. A passing health check is a point-in-time signal, not a backup or high-availability plan. If the dependency pauses, the owner must restore that dedicated project in Supabase and repeat the live invite/receipt smoke test. The public anonymous demo remains a separate fallback; never represent it as shared team storage.

## Before submission

- Open `/` in a fresh session: load Stripe, edit, approve and download Markdown with the unchanged original quote.
- Open `/team.html`: create a disposable account and a new empty workspace.
- Load the fictional case. Use independent browser profiles/private sessions for reviewer and recipient; normal tabs share cookies.
- Confirm invalid/reused invite refusal and reviewer/recipient restrictions.
- Revalidate, compare two sources, resolve and freshly approve.
- Owner issues once; repeated issue must preserve the original brief.
- Recipient downloads and acknowledges; reload and logout/login must preserve the receipt.
- Run the clearly labelled sandbox: reviewer approves, owner issues, recipient downloads/acknowledges; exit returns to real accounts.
- `/api/health`: HTTP 200, configured database reachable and team available.
- Open `/DeadEnd_Round3.pdf` and the GitHub link without sign-in. Ensure the PDF quotes the final reviewed and deployed commit, not a pending branch.
- Confirm README commands, final test/axe evidence and product PDF match that same release.
- Check actual Supabase/Vercel status near submission. No deployment is an uptime guarantee.
- Team leader reviews and submits the official form manually before the deadline. Do not submit automatically.
