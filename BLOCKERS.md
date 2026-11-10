# Open items
- No dedicated Supabase project or live model credential was available. Never reuse unrelated projects. Live extraction uses rules. Model integration tested with fixtures only.
- Public deployment is for synthetic/authorised public data. Durable multi-user identity, fine-grained source permissions, secret detection, and organisation-wide storage remain future work.
- GitHub import is bounded to 100 general comments plus 100 review summaries and 100 inline review comments per request. Bulk repositories, private GitHub sources, and semantic contradiction resolution are outside this version.
- Physical mobile device, motion preferences and pixel match to earlier reference image have not been independently verified. CSS provides a flat alternative for small screens/reduced motion.

## 10 November test and release constraints
- Preview deployment is READY but preview URLs are covered by the Vercel project's login protection (`ssoProtection: all_except_custom_domains`). The available public browser tool cannot access the preview or production hosts, and container Chromium blocks HTTP navigation by environment policy. This means **a fresh unauthenticated judge journey through the newest deployment has not been proven**. Keep main production intact until independently verified.
- No browser automation through an authenticated Vercel CLI is available in this environment. A Work-mode cloud browser or a manual incognito test is required to close this gap.
- The public GitHub real issue #501 was retrieved and tested as an extraction fixture; a real import through the live UI has not yet been verified and must not be claimed.
- The 390/768/1440 viewport checks used the supplied v0.6 source plus an equivalent CSS fallback, not the current remote branch. No physical device testing.
- Vercel preview was deployed before the latest mobile and one-click-real-example commits. Redeploy only after CI and inspect the new deployment before promotion.
