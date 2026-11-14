# Browser evidence

Run `npm run verify:browser` against an empty, disposable local PostgreSQL database. The test-only HTTP adapter invokes the actual checked-in PostgreSQL gateway function; production never imports it. This proves the browser/Node/PostgreSQL story, not the hosted Supabase network path.

```sh
npm ci
npx playwright install --with-deps chromium
# Create an EMPTY local database named deadend_test_browser.
# Set DEADEND_TEST_DATABASE_URL privately, then:
npm run check
npm run verify:browser
```

The Browser proof PR workflow supplies disposable PostgreSQL automatically. No production secrets are required. Generated PNGs contain only synthetic workspaces; invitation and password inputs are masked. No browser trace, video, cookie dump or storage-state file is generated. The safe reporter suppresses raw authentication call logs.

`DEADEND_BROWSER_BASE_URL` can optionally target an authorised deployed test instance. That mode skips direct SQL expiry manipulation; expired-invite browser verification remains local-only. No production invite is edited. Four accounts are registered once and reused across four workspace journeys to respect the normal authentication rate limit.

Committed evidence is bound to the source revision and CI run in its manifest. A new run produces browser-results.json and screenshots for its own checkout. Viewports are emulated 390×844, 768×1024, 1440×900 and 390×844 reduced motion. No physical-phone claim. Axe and keyboard evidence are in accessibility-manifest.json, axe-results.json, axe-role-results.json and keyboard-team-results.json.

## Accessibility

`npx playwright test tests/browser/accessibility.spec.js` runs axe-core (WCAG A/AA and 2.1 tags) on the public views, sign-in and loaded owner screen, plus keyboard routes. Serious/critical violations fail the run. `axe-results.json` includes incomplete checks requiring manual review; zero automated violations is not a WCAG conformance claim. `keyboard-results.json` states the exact exercised controls and remaining role boundaries.
