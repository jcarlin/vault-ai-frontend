# QA Bug Sweep — Vault AI Frontend

Date: 2026-02-22

## Bugs Found & Fixed

### 1. Turbopack catch-all route collision (CRITICAL)
**Routes:** `/api/p/vault/admin/config/models`, `/api/p/vault/admin/config/quarantine`
**Symptom:** 404 on these two endpoints — model defaults and quarantine config settings fail to load/save.
**Root cause:** Next.js App Router catch-all `[...path]` returns 404 when the last path segment matches a page route name (`models`, `quarantine`).
**Fix:** Created explicit route handlers at `src/app/api/p/vault/admin/config/models/route.ts` and `quarantine/route.ts`. Extracted shared proxy logic to `src/app/api/p/_proxy.ts` (DRY).

### 2. Negative activity timestamps (MEDIUM)
**Route:** All pages with sidebar (activity feed shows "-360m ago")
**Root cause:** Backend returns ISO timestamps without `Z` suffix (e.g., `2026-02-22T21:25:17.133493`). Browser parses as local time, but the value is UTC, causing a -6h offset.
**Fix:** Added `date-fns` library. Created `parseUTC()` utility in `formatters.ts` that appends `Z` before parsing. Updated all backend timestamp consumers (`Sidebar`, `AdvancedSettings`, `HeldFilesTable`, `formatModelDate`, `formatTimeAgo`).

### 3. SQLite schema drift — 4 missing columns (CRITICAL, backend)
**Symptom:** 500 errors on all authenticated endpoints.
**Root cause:** ORM models had columns not yet added to SQLite: `api_keys.user_id`, `users.password_hash`, `users.ldap_dn`, `users.auth_source`, `conversations.archived`.
**Fix:** Applied ALTER TABLE migrations to `vault.db`.

## Known Issues (Not Fixed)

### 4. Quarantine endpoints return 500 (MEDIUM, backend config)
**Routes:** `/quarantine` page — `/held`, `/signatures`, `/stats` all 500
**Root cause:** `VAULT_DEPLOYMENT_MODE=cloud` in backend `.env` skips quarantine pipeline initialization. The pipeline is Cube-only (requires ClamAV, YARA, filesystem). In production Cube mode this works; in cloud dev mode, endpoints are unavailable.
**Recommendation:** Frontend should handle 503/500 gracefully on quarantine page (show "Quarantine unavailable in cloud mode" instead of error toasts).

### 5. Recharts ResponsiveContainer -1 dimension warnings (LOW)
**Route:** `/insights` — 6 warnings on page load
**Symptom:** `The width(-1) and height(-1) of chart should be greater than 0` from Recharts.
**Root cause:** Known Recharts issue — `ResponsiveContainer` measures -1 during initial render before CSS layout settles. Charts render correctly after first paint.
**Attempted:** Added `w-full` to container divs and `minWidth={0}` to `ResponsiveContainer` — warnings persist.
**Impact:** Cosmetic console warning only. Charts display correctly.

### 6. WebSocket connection warning on Insights (LOW)
**Route:** `/insights`
**Symptom:** `WebSocket connection to 'ws://localhost:3000/ws/system' failed`
**Root cause:** The WebSocket endpoint is on the backend (:8000), but the frontend connects to `:3000`. The Next.js dev server doesn't proxy WebSocket connections through the catch-all API route.
**Impact:** Live metrics show "Connecting" but never connect in dev. Works in production where Caddy proxies WS.

## Pages Swept

| Route | Console Errors | Status |
|-------|---------------|--------|
| `/` | 0 | Clean |
| `/auth` | 0 | Clean |
| `/chat` | 0 | Clean (timestamps fixed) |
| `/insights` | 0 errors, 7 warnings | Recharts + WS warnings (known) |
| `/models` | 0 | Clean |
| `/audit` | 0 | Clean |
| `/quarantine` | 9 (backend 500s) | Backend config issue |
| `/settings` (all 7 tabs) | 0 | Clean |
