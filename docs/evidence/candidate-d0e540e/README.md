# Candidate browser evidence

Observed in browser: source d0e540e6a727060d80f4671bddd07d0853e8fa05 passed 7/7 browser tests; CI check passed 42/42 Node tests. See manifest.json for exact run and artifact digest. The 21 PNGs are original CI screenshots, without image editing. Password and invitation inputs are masked. Every account/workspace is synthetic.

These are local Node + actual SQL/disposable PostgreSQL tests, not hosted-candidate evidence. Viewports are emulated; no physical-phone claim. Raw axe reports record zero violations and incomplete checks requiring review. Zero violations does not establish WCAG conformance.

keyboard-results.json records one partial keyboard test only. keyboard-team-results.json records the separate complete owner/reviewer/recipient keyboard journey. The partial test's historical limit wording does not describe the complete suite.

A separate hosted public/team run against the existing production release passed: https://github.com/nikkushrivastava0-a11y/deadend-ai/actions/runs/43583742875 . It does not show that pending candidate features are deployed.

Reproduce with Node 22.x, npm ci, npx playwright install --with-deps chromium, an empty disposable local test database configured privately through DEADEND_TEST_DATABASE_URL, then npm run check and npm run verify:browser.
