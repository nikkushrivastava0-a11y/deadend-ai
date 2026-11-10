# CodersInPune Round 2 — Team leader form answers

**Status:** Final production release at main commit 7fe3d2c (24/24 automated tests plus four Chromium viewport/motion journeys passed). Google Drive PDF access and final team-leader form submission are still REQUIRED. Team leader submits once for the whole team.

## Hackathon
CodersInPune

## Team Name
NIKKUSHRIVASTAVA0

## Team Leader — Full Name
Nitanshu Shrivastav (match Round 1 spelling)

## Team Leader — Email Address
nikkushrivastava0@gmail.com

## Team Member Name each in one line
Nitanshu Shrivastav
Kanishk [REPLACE with his registered full name]

## Link to functioning project
https://deadend-ai-codersinpune.vercel.app/

## Source-code repository
https://github.com/nikkushrivastava0-a11y/deadend-ai

## Updated project PDF
https://drive.google.com/file/d/1oU9KDX4SS6noBpLTMgjrfhN0vqbiErk2/view?usp=drivesdk  — **OWNER ACTION: change General access to Anyone with the link / Viewer; confirmed private as of 10 November.** Public hosted report: https://deadend-ai-codersinpune.vercel.app/DeadEnd_Round2.pdf

## Features completed — verified production
- Responsive evidence investigation desk with interactive CSS-3D constellation
- Public GitHub issue/PR discussion and permitted-note imports
- Candidate rejected-approach extraction by explicit language, with precise supporting quotations
- Source quote verification and GitHub evidence permalinks
- Human review, correction, approval, rejection and dispute
- Public approved-handover generation and Markdown download
- Guided fictional Stripe case to demonstrate the workflow
- Session-isolated, expiring encrypted browser-held workspaces in the hosted demo

Also shipped and browser-verified in headless Chromium at 1440x900, 768x1024, 390x844 and reduced-motion 390x844:
- Different GitHub comments with identical wording have distinct provenance records
- Finding links expose original author and timestamp
- Source-linked possible reconsideration warnings and question-style decision lookup
- Direct real public example import, keyboard and mobile scene fallback

## Technology and implementation details
Node.js HTTP server and Vercel serverless adapter; semantic HTML, vanilla JavaScript, CSS 3D transforms; GitHub REST API public issue, PR, issue-comment and inline-review data; evidence-first deterministic quote extraction; optional OpenAI structured extraction (not live-verified), AES-256-GCM time-limited browser workspace capsules, server-side quoted-text and original-source checks, review state machine, public-only handover. GitHub Actions runs Node test suite.

## Changes from Round 1
We narrowed the MVP to one dependable public GitHub discussion-to-handover path rather than a broad enterprise integration ecosystem. Instead of the initially suggested Next.js, Supabase and OpenAI Agents SDK stack, we used a dependency-free Node server and vanilla frontend to make review and evidence reliable in the build window. Interactive CSS perspective replaces promised WebGL; the user receives a functional source-to-approval workflow with honest limitations. No private organisational data was needed.

## What does not work yet?
Full authenticated multi-user collaboration, server-side per-role access controls, durable shared storage, cross-source semantic reconciliation and verified live AI generation are not implemented. Public GitHub API limits may block imports; some discussions have no candidate rejection and correctly show an empty state. Headless Chromium E2E on the final production release passed at desktop/tablet/phone emulation and reduced motion. A physical mobile device and real OpenAI extraction remain unverified. Use your own incognito browser once more before submission.

## Round 3 major improvement 1
Decision Revalidation Workflow — Add owner-created recheck tasks, current-constraint status, and a dated change history for abandoned approaches. The incoming developer will know whether a historical decision is still applicable.

## Round 3 major improvement 2
Cross-Source Disagreement Resolver — Extract and compare contradictory project statements across two authorised sources, show both exact quotations, and require a human resolution before handover publication.

## Round 3 major improvement 3
Role-Aware Handover and Recipient Acknowledgement — Add authenticated roles, server-enforced source visibility, versioned approved briefs and recipient acknowledgement, so incoming teammates only receive authorised, signed-off information.

## Final confirmation
Do not tick until you personally open functioning app, public repo and PDF Drive link in incognito and verify all claims. Only team leader submits the form. This document is assistance, not the form submission.

## Final verification record
- Full Node suite 24/24 passed on security-header PR #6; Github Actions successful.
- Live product: production deployment dpl_v3NCmvFojJKXPdA5EW7CRbzcXrnu READY, site and health API 200, PDF 200.
- Browser workflow: fresh example -> Stripe inquiry -> correction -> approval -> Markdown download at desktop/tablet/phone/reduced motion, 4/4 headless Chromium checks successful. Physical phone not tested.
- Secure response headers verified on production; API cache no-store.
