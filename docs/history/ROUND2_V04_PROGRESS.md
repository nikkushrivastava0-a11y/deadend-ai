# DeadEnd Round 2 — v0.4 progress

## Changes made (9 November 2026)

- **Browser-session isolation:** Anonymous visitors no longer share one global review workspace. Each receives a random 192-bit HttpOnly SameSite=Lax cookie and a separate volatile workspace. Session expiry is two hours with an in-process capacity bound.
- **Citation provenance:** Imported public GitHub issue comments now retain individual comment URLs. A candidate must map to the exact original text segment and associated comment URL before verification succeeds.
- **Integration tests:** Added cross-browser session isolation checks, approval-to-handover test, restricted evidence rejection, and comment citation tampering test.
- **Checks:** `npm test` reports **9 passed, 0 failed** in the local environment.

## Important limitations — do not hide from judges

- This is **not authentication** or multi-user authorisation. A browser session cookie is only a demo workspace boundary; reviewers are not identity-verified.
- All state is **in memory**; server restarts clear it. A multi-instance serverless deployment needs persistent storage.
- GitHub ingestion works only for **public individual issue/PR URLs**, is rate limited by GitHub, and must still be validated using a live network connection.
- Extraction is deterministic heuristic matching, not an OpenAI Agent. Context and contradiction detection are limited.
- Restricted uploaded notes remain in the importing user's volatile workspace but are excluded from the public handover; confidential data should never be imported into this prototype.
- No public repository, public deployment or updated Round 2 PDF is claimed by this package.

## Next release blocker

Implement durable Supabase persistence with authenticated, per-user roles and server-side RLS before hosting this as a multi-user product. Then deploy and run end-to-end tests against the public URL before submitting to organisers.
