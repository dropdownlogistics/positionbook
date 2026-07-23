// Auth decommissioned 2026-07-23 per DECISION-AUTH-20260723 (Clerk removed org-wide).
// requireUserId() now always returns null, so every /api/positions route returns 401
// and no trader data is served on the public demo. Real data lives offline.
// When auth is rebuilt, restore session resolution and JIT user provisioning here.
export async function requireUserId(): Promise<string | null> {
  return null
}
