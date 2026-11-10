# DeadEnd AI — Round 2 engineering release candidate

**Date:** 10 November 2026 (IST)  
**Team:** NIKKUSHRIVASTAVA0  
**Team lead:** Nitanshu Shrivastav  
**Source:** https://github.com/nikkushrivastava0-a11y/deadend-ai  
**Current production:** https://deadend-ai-codersinpune.vercel.app/  
**Draft review:** https://github.com/nikkushrivastava0-a11y/deadend-ai/pull/1

## What is actually in production (baseline f0e57c5)
- A dark investigation workspace with interactive **CSS 3D perspective** (not a React Three Fiber or WebGL application).
- Public GitHub issue/PR discussion and pasted-note intake, rule-based extraction, source quotes and public permalinks.
- Reviewer correction, approve/dispute/reject flow and Markdown handover, restricted examples excluded.
- Guided synthetic demo; individually isolated encrypted browser-held workspace for the public Vercel deployment.
- Previous verification recorded 15 automated tests and a synthetic evidence-to-handover journey.

## Candidate changes in PR #1 (NOT yet on production)
- Distinct source-segment attribution for identical GitHub comment quotations and independent evidence checks.
- GitHub author/date preservation, including model-selected excerpts.
- Adjacent re-evaluation statements are shown as possible context updates, never treated as proof a previous blocker is fixed.
- Source links included in update callouts and exported Markdown.
- Added direct synthetic Stripe journey and one-click **real public issue** importer (Ruuvi issue #501).
- User-question-style finding search, keyboard orbit and 2-column flat-card fallback for small or reduced-motion environments.
- Subtle lighting and glass-depth refinements without changing the main semantic workflow.
- A GitHub Actions CI job running `npm run check` for pull requests.

## Source-backed real case
**Ruuvi project, issue #501:** https://github.com/ruuvi/com.ruuvi.station.webui/issues/501  
The issue body states: “Previously we abandoned idea to compare multiple units in single chart, because there are obvious limitations and we didn't find a pretty solution.” It separately says “But we should consider this in the future.”

The first sentence is evidence of a *historically abandoned approach*, not a recommendation that it should never be used. The second is a *possible reconsideration*, not proof the original limitations have disappeared.

Tests use that exact public record. They verify its quotation, source permalink, review corrections and handover; they do **not** prove that an external reviewer can successfully import the source through the deployed public UI.

## Tested evidence
- CI run at branch commit `00324a1`: **18/18 Node tests passing**, with zero failed tests.
- Regression coverage includes duplicate comment quotations, wrong permalink, unconnected reversals, restricted evidence, edits and approvals, reviewer corrections, model-output fixtures, simulated GitHub upstream failure, anonymous session isolation and encrypted-state tampering.
- Local static layout exercise at 390×844, 768×1024 and 1440×900; earlier narrow-view crop reproduced and candidate fallback corrected in an equivalent local snapshot. **Not a physical mobile test or live-browser certification.**
- Isolated Vercel preview `dpl_HAxcziAXXKxvFJMDkZGKNAiQLbYp` reported READY for source at `00324a1`. Preview is deployment-protected, and local HTTP/browser access to preview was blocked; READY alone does not prove the judge journey.

## Round 1 to Round 2 design decisions
- Replaced a planned Next.js/Supabase/Agents SDK application with a smaller dependency-free Node HTTP server and vanilla-JS frontend to protect delivery time.
- Built the visual graph with CSS 3D instead of Three.js/React Three Fiber; it is interactive with pointer input, and the candidate adds keyboard input and reduced-motion fallback.
- Optional structured model selection exists but had no authorised live model credential at verification time. Rule-based extraction is functional; **do not claim live AI extraction ran**.
- Role-based identity, enterprise private-data sharing and server-side per-user RLS are **not implemented**. Public source and synthetic-data demo only.

## Known issues and honest exclusions
- Real GitHub imports sometimes yield no relevant historical rejected approach: empty results may be accurate. An untested public issue is not guaranteed to yield a finding.
- Cross-source re-evaluation is heuristic and can propose false-positive/irrelevant updates; review is mandatory.
- This is not an enterprise permissions system. Restricted items are excluded from public handover; that does not substitute for private-data authorisation.
- Public deploy has expiring session storage, not durable multi-user collaboration.
- Live phone/tablet screenshots, unauthenticated candidate preview and live model calls are not verified in this session.

## Three substantial and realistically scoped Round 3 commitments
1. **Decision revalidation workflow.** Add explicit owner-triggered recheck requests, timestamps and status history; an incoming developer can tell whether the reason for abandonment is still valid.
2. **Cross-source disagreement resolver.** Compare two authorised discussions, show both quotations and allow an owner to resolve disagreements before sharing, rather than only heuristic update hints.
3. **Role-aware handover sharing and acknowledgement.** Introduce authenticated recipient roles, server-enforced per-source visibility and recipient acknowledgement for an approved, versioned handover.

## Reviewer walk-through
1. Open **Open an example case**.
2. Choose the Stripe finding; inspect the original wording and possible follow-up.
3. Edit the interpretation while keeping the original quotation unchanged.
4. Approve, open Handover and download Markdown.
5. Optionally import the genuine Ruuvi issue using Add evidence; compare the original public issue with the extracted candidate.

**Do not use private company data.** Only the team leader submits the Round 2 form. Do not claim branch features have shipped until the release is actually promoted and reverified.
