# redirect-test

Minimal Next.js repro app for investigating a possible `cacheComponents` + server `redirect()` bug.

The app is intentionally small and focuses on one sequence:

```txt
/dashboard -> /verify-identity -> /dashboard -> /onboarding -> /dashboard -> /complete
```

The important detail is that each target page prepares the **next server state first**, and the button itself only performs `router.replace("/dashboard")`.

## Versions

- Next.js `16.2.2`
- React `19.2.4`
- Node `20.14.0`
- pnpm `10.6.5`

## Routes

- `/dashboard`
- `/verify-identity`
- `/onboarding`
- `/complete`

## Repro model

State is stored in a single cookie:

- `verify`
- `onboarding`
- `complete`

`/dashboard` reads the cookie and server-redirects:

- `verify` -> `/verify-identity`
- `onboarding` -> `/onboarding`
- `complete` -> `/complete`

## Flow

1. Visit `/dashboard`
2. Server redirects to `/verify-identity`
3. `/verify-identity` prepares cookie state `onboarding` on mount
4. Click the button that only calls `router.replace("/dashboard")`
5. Expected result: first attempt lands on `/onboarding`
6. `/onboarding` prepares cookie state `complete` on mount
7. Click the button that only calls `router.replace("/dashboard")`
8. Expected result: first attempt lands on `/complete`

## Install and run

```bash
pnpm install
pnpm patch:off
pnpm dev
```

## Toggle the local Next patch

This repo contains a local A/B toggle for a `RedirectBoundary` patch.

```bash
pnpm patch:status
pnpm patch:off
pnpm patch:on
```

Files toggled by the script:

- `node_modules/next/dist/client/components/layout-router.js`
- `node_modules/next/dist/client/components/redirect-boundary.js`
- `node_modules/next/dist/client/components/redirect-boundary.d.ts`

### Patched behavior

The patched mode does four things:

1. Passes `isActive` from `layout-router` into `RedirectBoundary`
2. Clears stale `redirect` and `redirectType` when the boundary becomes inactive
3. Only renders `HandleRedirect` while the boundary is active
4. Clears `redirectType` during `reset()` as well

## What to look for

The debug panel on each page shows:

- `mountId`
- `renderCount`
- `effectCycles`
- `cleanupCount`

The key comparison is not whether effects replay at all. With `cacheComponents`, replay is expected.

The key comparison is whether preserved inactive routes can still cause duplicate redirect handling.

### Expected stock behavior (`pnpm patch:off`)

In the currently observed repro, the same preserved instance can re-appear more than once before the flow moves forward.

Observed pattern:

- `verify` appears twice with the same `mountId`
- `onboarding` appears twice with the same `mountId`
- `complete` appears once

Example observation:

- `verify1`: `mountId: 1`, `effectCycles: 2`, `cleanupCount: 1`
- `verify2`: `mountId: 1`, `effectCycles: 3`, `cleanupCount: 2`
- `onboarding1`: `mountId: 2`, `effectCycles: 2`, `cleanupCount: 1`
- `onboarding2`: `mountId: 2`, `effectCycles: 3`, `cleanupCount: 2`
- `complete`: `mountId: 3`, `effectCycles: 1`, `cleanupCount: 0`

### Expected patched behavior (`pnpm patch:on`)

Preserved route instances still exist and effects can still replay, but duplicate redirect handling should disappear.

Observed pattern:

- `verify` appears once
- `onboarding` appears once
- `complete` appears once

Example observation:

- `verify`: `mountId: 1`, `effectCycles: 2`, `cleanupCount: 1`
- `onboarding`: `mountId: 2`, `effectCycles: 2`, `cleanupCount: 1`
- `complete`: `mountId: 3`, `effectCycles: 1`, `cleanupCount: 0`

This is important: the patch does **not** disable `Activity` preservation. It only prevents inactive preserved `RedirectBoundary` instances from executing redirect side effects again.
