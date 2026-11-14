# Judge sandbox boundary

The primary product uses real individual accounts and durable PostgreSQL workspaces. The optional sandbox is a 15-minute synthetic, single-tab demonstration with pre-wired owner, reviewer and recipient principals. The role selector changes only that sandbox's principal; every action is checked on the server.

The sandbox accepts no imports, real workspace IDs, invitations, account operations or arbitrary recipients. Its handler never calls real workspace read/save operations. Creation uses the existing database-backed rate limiter (20 starts per 15-minute bucket per IP). If that dependency is down, creation fails politely; the anonymous public demo remains separate.

Synthetic state and the selected role are authenticated/encrypted using the existing server state key, with an additional sandbox purpose and 15-minute expiry. The capsule is stored only in this tab's sessionStorage. It is never accepted as a real team cookie or account session. The original expiry is retained on each action. Expired capsules are refused; abandoned data disappears with the tab. No durable synthetic account/workspace rows are created.

This is not multi-user persistence or proof of production-account security. A judge deliberately controls all synthetic roles; old capsules can replay/fork their own fictional history until expiry. The sandbox does not replace real-account invite/receipt tests. No real credentials or source data should be pasted into it.
