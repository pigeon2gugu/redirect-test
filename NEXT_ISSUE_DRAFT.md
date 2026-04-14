## Description

With `cacheComponents: true`, a preserved hidden route appears able to replay redirect handling from `RedirectBoundary` and interfere with the next client-side forward navigation.

I created this repro to compare stock Next behavior against a small local `RedirectBoundary` patch.

The reproduction app has a small state machine:

- `/dashboard` server-redirects based on cookie state
- `/verify-identity` prepares `onboarding` on mount, then the button only calls `router.replace("/dashboard")`
- `/onboarding` prepares `complete` on mount, then the button only calls `router.replace("/dashboard")`
- `/complete` is the terminal page

The important part is that the button itself does not mutate server state. It only triggers re-entry into the dashboard route.

### Link to the code that reproduces this issue

Replace this with your repro repository URL:

https://github.com/pigeon2gugu/redirect-test

### To Reproduce

1. Clone the repro and install dependencies
2. Run `pnpm patch:off`
3. Run `pnpm dev`
4. Open `/dashboard`
5. Allow the app to redirect to `/verify-identity`
6. Wait until the page prepares the next cookie state (`onboarding`)
7. Click the button that only calls `router.replace("/dashboard")`
8. Observe that the same preserved route instance can appear more than once before moving forward
9. Repeat the same comparison with `pnpm patch:on`

### Current behavior

With `pnpm patch:off`, I observe duplicate appearances of the same route with the same `mountId` before the flow moves forward.

Observed sequence:

- `verify1`
- `verify2`
- `onboarding1`
- `onboarding2`
- `complete`

Observed debug values:

- `verify1`: `mountId: 1`, `renderCount: 4`, `effectCycles: 2`, `cleanupCount: 1`
- `verify2`: `mountId: 1`, `renderCount: 6`, `effectCycles: 3`, `cleanupCount: 2`
- `onboarding1`: `mountId: 2`, `renderCount: 4`, `effectCycles: 2`, `cleanupCount: 1`
- `onboarding2`: `mountId: 2`, `renderCount: 6`, `effectCycles: 3`, `cleanupCount: 2`
- `complete`: `mountId: 3`, `renderCount: 2`, `effectCycles: 1`, `cleanupCount: 0`

This suggests that the same preserved route instance is re-participating in the flow.

### Expected behavior

With stock behavior, I would expect the flow to move forward once per stage:

- `verify`
- `onboarding`
- `complete`

When I apply the local patch (`pnpm patch:on`), that is exactly what happens.

Observed patched sequence:

- `verify`
- `onboarding`
- `complete`

Observed debug values:

- `verify`: `mountId: 1`, `renderCount: 4`, `effectCycles: 2`, `cleanupCount: 1`
- `onboarding`: `mountId: 2`, `renderCount: 4`, `effectCycles: 2`, `cleanupCount: 1`
- `complete`: `mountId: 3`, `renderCount: 2`, `effectCycles: 1`, `cleanupCount: 0`

The important distinction is that the patch does not remove `Activity` preservation or effect replay. It only prevents inactive preserved `RedirectBoundary` instances from executing redirect side effects again.

### Local patch used for comparison

The local patch does four things:

1. Passes `isActive` from `layout-router` into `RedirectBoundary`
2. Clears stale `redirect` and `redirectType` when the boundary becomes inactive
3. Only renders `HandleRedirect` while the boundary is active
4. Clears `redirectType` during `reset()` as well

<details>
<summary>Local patch diff</summary>

```diff
diff --git a/node_modules/next/dist/client/components/layout-router.js b/node_modules/next/dist/client/components/layout-router.js
@@
-                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_redirectboundary.RedirectBoundary, {
+                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_redirectboundary.RedirectBoundary, {
+                                isActive: isActive && stateKey === activeStateKey,
                                 children: [
                                     /*#__PURE__*/ (0, _jsxruntime.jsx)(InnerLayoutRouter, {
                                         url: url,
                                         tree: tree,
                                         params: params,
diff --git a/node_modules/next/dist/client/components/redirect-boundary.js b/node_modules/next/dist/client/components/redirect-boundary.js
@@
 class RedirectErrorBoundary extends _react.default.Component {
@@
+    componentDidUpdate() {
+        if (!this.props.isActive && (this.state.redirect !== null || this.state.redirectType !== null)) {
+            this.setState({
+                redirect: null,
+                redirectType: null
+            });
+        }
+    }
     render() {
         const { redirect, redirectType } = this.state;
-        if (redirect !== null && redirectType !== null) {
+        const shouldHandleRedirect = redirect !== null && redirectType !== null && this.props.isActive !== false;
+        if (shouldHandleRedirect) {
             return /*#__PURE__*/ (0, _jsxruntime.jsx)(HandleRedirect, {
                 redirect: redirect,
                 redirectType: redirectType,
                 reset: ()=>this.setState({
-                        redirect: null
+                        redirect: null,
+                        redirectType: null
                     })
             });
         }
         return this.props.children;
     }
 }
-function RedirectBoundary({ children }) {
+function RedirectBoundary({ children, isActive }) {
     const router = (0, _navigation.useRouter)();
     return /*#__PURE__*/ (0, _jsxruntime.jsx)(RedirectErrorBoundary, {
         router: router,
+        isActive: isActive,
         children: children
     });
 }
diff --git a/node_modules/next/dist/client/components/redirect-boundary.d.ts b/node_modules/next/dist/client/components/redirect-boundary.d.ts
@@
 interface RedirectBoundaryProps {
     router: AppRouterInstance;
     children: React.ReactNode;
+    isActive?: boolean;
 }
@@
+    componentDidUpdate(): void;
     render(): React.ReactNode;
 }
-export declare function RedirectBoundary({ children }: {
+export declare function RedirectBoundary({ children, isActive }: {
     children: React.ReactNode;
+    isActive?: boolean;
 }): import("react/jsx-runtime").JSX.Element;
```

</details>

### Verify canary release

Not yet verified against canary.

### Provide environment information

- Next.js: `16.2.2`
- React: `19.2.4`
- Node: `20.14.0`
- pnpm: `10.6.5`
- OS: `macOS 14.6 (arm64)`

### Which area(s) are affected?

- App Router
- `cacheComponents`
- `redirect()` / `RedirectBoundary`

### Which stage(s) are affected?

- `next dev`

### Additional context

This is a minimal repro focused on isolating the RedirectBoundary behavior under cacheComponents. The A/B comparison with the local patch demonstrates the specific component responsible.

- stock Next: duplicated route participation from the same preserved instance
- patched Next: one forward transition per stage

That seems consistent with a hidden preserved `RedirectBoundary` being able to re-run redirect handling when it should no longer affect the active route.
