# Production release evidence

Observed in browser: all eight Playwright tests passed against deployed application c5c1d757c3beffe48c7e433ee73c28d920a83e9e. Exact source/run/artifact identities are in manifest.json. The test source differs only by CI configuration from the deployed application source. Local PostgreSQL browser proof is recorded separately.

The 21 PNGs are original hosted CI screenshots; passwords and invitation inputs are masked. manual-sandbox-receipt.jpg is a separate cloud-browser observation of the synthetic receipt after reload. manual-browser-check.json records that journey and the observed textarea foreground/background contrast. No physical-phone or screen-reader test is claimed.

Raw axe reports contain zero reported violations and incomplete checks requiring additional review. An automated zero is not WCAG conformance. Fixture 409/503 cases are not a physical database outage test.
