# Current hosted option

The new `/team.html` workflow provides individual custom accounts, durable PostgreSQL storage and recipient receipts on Vercel. See [HOSTED_TEAM.md](HOSTED_TEAM.md) for setup and current limits. The dedicated disk-backed service described below remains an alternative deployment; its earlier hosted limitation does not describe the new PostgreSQL path.

# Round 3 review workflows

Implements the three commitments on page 6 of the submitted Round 2 report. This is an extension of main `30f1d0f`, not a replacement product.

## 1. Decision revalidation

Findings → “Record an owner recheck”. Record checked date (IST), current constraint and `unknown`, `still-blocked` or `changed`. The last two require an exact supporting quotation from an imported source segment. Matching a quotation proves provenance, not that its technical assertion is correct. Rechecks preserve original evidence, keep append-only dated history and invalidate the prior approval. Version checks reject stale writes. Review again before export.

## 2. Cross-source disagreement

Findings → “Compare disagreement in two sources”. The original finding supplies the first excerpt. Select a different imported source segment and copy its contradictory excerpt. Mixed public/restricted comparisons are refused. The app records a possible disagreement; it does not infer which source is true. A human chooses original applies, second applies, context dependent, or unresolved, explains why, and records the next action. Both original excerpts remain attached. Unresolved disagreements block approval and export. A resolution reopens the finding for fresh approval. Markdown includes both citations and the human resolution.

## 3. Role-aware brief and receipt

Implemented for a **dedicated single-process Node service with durable disk**. Not enabled in the anonymous Vercel demo. Do not claim hosted completion of this commitment until an authenticated deployment is tested.

Configure `DEADEND_DATA_DIR` to an absolute directory on persistent storage, and `DEADEND_TEAM_USERS` as a JSON array of `{username, role, salt, passwordHash}` records. Use unique strong account passwords. Generate each salt/hash with `node scripts/hash-password.mjs`, supplying a password through stdin (not command-line arguments). The script emits only salt and scrypt hash. No real credentials belong in Git.

Example identity structure (replace every placeholder; this example intentionally fails validation):

```json
[
  {"username":"nitanshu","role":"owner","salt":"REPLACE","passwordHash":"REPLACE"},
  {"username":"kanishk","role":"reviewer","salt":"REPLACE","passwordHash":"REPLACE"},
  {"username":"incoming-dev","role":"recipient","salt":"REPLACE","passwordHash":"REPLACE"}
]
```

Run `npm ci && npm start`. The browser prompts for individual HTTP Basic credentials. Use HTTPS behind the hosting provider/reverse proxy for any nonlocal service. No user self-registration, OAuth, password recovery or role switch is included.

| Role | Server-enforced access |
| --- | --- |
| Owner | Import, revalidate, view all authorised source records, review and issue public approved briefs |
| Reviewer | Public sources and findings; review and reconcile public disagreements; no restricted records or imports |
| Recipient | Only immutable briefs explicitly addressed to their configured username; acknowledge their own receipts |

Only approved **public** findings enter briefs. Restricted handovers are deliberately unsupported. The owner issues a snapshot from Handover, selecting a configured recipient. Later edits/rejections do not rewrite an issued version. Reissuing identical content to the same recipient returns the existing version. Acknowledgement is idempotent and bound to the authenticated recipient. No email or other notification is sent. Existing issued history prevents destructive demo/reset operations.

The shared `team.json` file is atomically written with owner-only filesystem permissions before successful mutation responses. It is separate from anonymous sessions and browser capsules. The API refuses team mode on Vercel and without a data directory. Keep exactly one Node process, back up the directory, and provide durable storage; ephemeral free containers cannot meet cross-restart durability. No new paid service is provisioned by this change.

## Tests and verification limits

`npm run check` builds local Three.js/fonts/social assets and runs the existing suite plus Round 3 unit/API tests. New tests cover dated history, invalid/future dates, invented quotes, mixed visibility, stale writes, unresolved export, fresh approval, role denials, two recipients, immutable versions, duplicate issue/receipt, and restart recovery on a temporary local filesystem.

The public demo supports the first two workflows without credentials, explicitly labelled anonymous. It does not simulate authenticated recipients. The third workflow is locally reproducible, not a hosted organisational feature. Live model extraction, private GitHub authorisation, multi-process storage and physical-device testing remain outside the verified scope.

Round 3 form: https://forms.gle/FxhT5Z1NupvGTGSw6 . Team leader submits once, by 16 November 2026 23:59 IST. Do not submit automatically. Team: Nitanshu Shrivastav (lead), Kanishk Baghel (member).
