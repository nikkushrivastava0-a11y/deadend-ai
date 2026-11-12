# DeadEnd AI — Human-first Case Room UI redesign

## Files and full-source delivery

Every link is the **complete updated source file**, not an excerpt. This delivery stays in plain HTML, CSS, vanilla JavaScript, Three.js, Node.js, and Vercel.

| File | Why it changed |
| --- | --- |
| `public/design-system.css` | New single design-token layer: graphite, off-white, restrained sage accent, semantic statuses, 8px spacing, fixed type scale, shared components, responsive rules. |
| `public/index.html` | Hero now has one primary "Trace the Stripe case" button and one quiet link. An evidence-backed finding is above the fold, with a smaller separate 3D map and a source-quote inspector. Navigation is consistently Source / Finding / Handover. |
| `public/app.js` | Loads the synthetic example into a fresh empty demo workspace, renders the real quote and interpretation, connects the 3D inspector to that claim, places quotations ahead of findings/handovers and gives meaningful empty states. API, review decisions and Markdown export logic remain intact. |
| `src/scene3d.js` | Keeps real Three.js, pointer raycasting and camera interaction; removes idle bobbing, lighting movement and endless decorative frames. Rendering is event driven; non-WebGL fallback remains. |
| `server.js` | Whitelists the new static design-system stylesheet; no evidence/API behavior changed. |
| `scripts/build-assets.mjs` | Removes extra sans/monospace CSS font-family declarations; UI uses DM Sans and native evidence monospace. |
| `scripts/copy-fonts.mjs` | Maintains a compatibility resource for existing font-route regression tests; the UI doesn't load the extra face. |
| `public/about.html`, `public/privacy.html`, `public/404.html` | Load the same new design tokens as the app. |
| `tests/site-quality.test.js` | Updates the one intentionally changed hero-link expectation and checks that evidence inspector and featured quote exist. |

## Terms

- **Source** — an imported public GitHub issue, PR discussion, or authorised note.
- **Finding** — a candidate interpretation of an abandoned approach, with the original quote.
- **Handover** — the Markdown document containing reviewed/approved public findings.

## Selectors and IDs

### Existing IDs preserved
`#demoBtn`, `#stripeJourney`, `#scene`, `#sceneOrbit`, `#tracePick`, `#sceneSelection`, `#inspectorTag`, `#inspectorTitle`, `#inspectorBody`, `#inspectorAction`, `#sourceList`, `#claimList`, `#downloadBtn`, `#handoverList`, `#statSources`, `#statFindings`, `#statPending`, `#statApproved`, `#search`, `#filter`, `#editor`, `#correctText`, `#sidebarNav`, `#menuToggle`.

### New IDs
`#featuredFinding`, `#featuredStatus`, `#featuredQuote`, `#featuredInterpretation`, `#featuredSource`, `#featuredApprove`, `#featuredEdit`, `#inspectorQuote`, `#inspectorMeta`, `#caseMapHeading`.

### CSS selectors intentionally changed or added
- `.claim blockquote` now has `.claim-quote` to make the evidence quote first.
- Added `.feature-card`, `.feature-top`, `.feature-actions`, `.case-map`, `.inspector-quote`, `.empty-state`, `.claim-label`.
- `#stripeJourney` remains a link to `#findings` and is the hero's **single secondary** action.
- `#demoBtn` remains the hero's **single primary** button.
- `[data-review]`, `[data-edit]`, `[data-node]`, `[data-view]`, `[data-goto]` and source quote IDs remain in place.

## Test procedure

1. On first visit, the example must load without four zero counters above the fold.
2. The featured quote must match the imported source quote exactly.
3. Clicking a node must reveal a **real original quote** in `#inspectorQuote`, not filler text.
4. Use the primary button and the quiet link; the selected Stripe finding must open.
5. Edit its interpretation and save; the source quote must remain unchanged.
6. Approve a public finding, open Handover and download `deadend-handover.md`.
7. Test 1440px, 768px, 390px, 320px and a reduced-motion 390px browser.
8. Confirm no horizontal overflow, JavaScript errors or failed frontend requests.
9. On 320px and 390px, use the semantic node grid (not WebGL); ensure menu opens/closes.
10. Run `npm run check` and check the full Node test count and exit status.

## Not in scope

No change to `engine.js`, evidence extraction, server-side verification, review endpoints, access policy, handover item filtering, or Markdown serialization. No invented testimonials or additional frameworks.

## Design decision

This is a pragmatic product release: quote first, interpretation second, actions last. The 3D map is an optional evidence navigator, not the main content.
