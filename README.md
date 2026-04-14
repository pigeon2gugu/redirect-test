# redirect-test

Minimal Next.js repro app for investigating a possible `cacheComponents` + server `redirect()` bug.

The app is intentionally small and focuses on one sequence:

```txt
/dashboard -> /verify-identity -> /dashboard -> /onboarding -> /dashboard -> /complete
```

The important detail is that the gated target buttons prepare the **next server state** via a server action, then call `router.replace("/dashboard")`.

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
3. Click the button that prepares cookie state `onboarding`, then calls `router.replace("/dashboard")`
4. Expected result: first attempt lands on `/onboarding`
5. Click the button that prepares cookie state `complete`, then calls `router.replace("/dashboard")`
6. Expected result: first attempt lands on `/complete`
7. Use the reset button to clear the cookie and restart the cycle

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

The key comparison is not whether `Activity` preservation exists at all. With `cacheComponents`, preservation is expected.

The key comparison is whether preserved inactive routes can still cause duplicate redirect handling during forward navigation.

### Expected stock behavior (`pnpm patch:off`)

In the problematic stock behavior, a stage can visibly re-appear before the flow moves forward.

Typical pattern to watch for:

- `/verify-identity` appears again before the app reaches `/onboarding`
- `/onboarding` appears again before the app reaches `/complete`

In other words, the visible flow can look like:

```txt
verify -> verify -> onboarding -> onboarding -> complete
```

### Expected patched behavior (`pnpm patch:on`)

With the local patch enabled, the flow should move forward once per stage:

```txt
verify -> onboarding -> complete
```

This is important: the patch does **not** disable `Activity` preservation. It only prevents inactive preserved `RedirectBoundary` instances from executing redirect side effects again.
