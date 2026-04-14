## Description

With `cacheComponents: true`, a preserved hidden route appears able to replay redirect handling from `RedirectBoundary` and interfere with the next client-side forward navigation.

I created this repro to compare stock Next behavior against a small local `RedirectBoundary` patch.

The reproduction app has a small state machine:

- `/dashboard` server-redirects based on cookie state
- `/verify-identity` has a button that first prepares `onboarding` via a server action, then calls `router.replace("/dashboard")`
- `/onboarding` has a button that first prepares `complete` via a server action, then calls `router.replace("/dashboard")`
- `/complete` is the terminal page

The important part is that the gated routes do not auto-advance on mount. Progression happens when the button prepares the next server state and re-enters the dashboard route.

### Link to the code that reproduces this issue

Replace this with your repro repository URL:

https://github.com/pigeon2gugu/redirect-test

### To Reproduce

1. Clone the repro and install dependencies
2. Run `pnpm patch:off`
3. Run `pnpm dev`
4. Open `/dashboard`
5. Allow the app to redirect to `/verify-identity`
6. Click the button that prepares `onboarding` and then calls `router.replace("/dashboard")`
7. Observe whether `/verify-identity` appears again before the app reaches `/onboarding`
8. On `/onboarding`, click the button that prepares `complete` and then calls `router.replace("/dashboard")`
9. Observe whether `/onboarding` appears again before the app reaches `/complete`
10. Repeat the same comparison with `pnpm patch:on`

### Current behavior

With `pnpm patch:off`, I can reproduce duplicate visible participation of the same stage before the flow moves forward.

Typical visible sequence:

- `verify`
- `verify`
- `onboarding`
- `onboarding`
- `complete`

This suggests that a preserved route is re-participating in redirect handling during forward navigation when it should no longer affect the active route.

### Expected behavior

With stock behavior, I would expect the flow to move forward once per stage:

- `verify`
- `onboarding`
- `complete`

When I apply the local patch (`pnpm patch:on`), that is exactly what happens.

The important distinction is that the patch does not remove `Activity` preservation or effect replay. It only prevents inactive preserved `RedirectBoundary` instances from executing redirect side effects again.

### Local patch used for comparison

The local patch does four things:

1. Passes `isActive` from `layout-router` into `RedirectBoundary`
2. Clears stale `redirect` and `redirectType` when the boundary becomes inactive
3. Only renders `HandleRedirect` while the boundary is active
4. Clears `redirectType` during `reset()` as well

<details>
<summary>Local patch diff</summary>

This is the minimal relevant diff, not the full file snapshot.

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

Yes. I also reproduced the issue on stock canary.

This was the version resolved by `pnpm add next@canary` at the time of testing.

- tested canary version: `16.2.1-canary.38`
- result: the duplicated visible-stage behavior still reproduces with `pnpm patch:off`
- note: I did not re-apply the local patch comparison on canary yet, because the current patch snapshots were prepared against `16.2.2`

### Provide environment information

- Next.js stable repro version: `16.2.2`
- Next.js canary repro version: `16.2.1-canary.38`
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
- `next build` + `next start`

### Additional context

I previously used extra debug instrumentation to confirm more internal details, but this repository is intentionally kept simpler now.

The current repro still shows a meaningful A/B difference on stable, and the stock canary still reproduces the problematic behavior:

- stock stable: duplicated visible stage participation during forward navigation
- patched stable: one forward transition per stage
- stock canary: duplicated visible-stage behavior still reproduces

That seems consistent with a hidden preserved `RedirectBoundary` being able to re-run redirect handling when it should no longer affect the active route.
