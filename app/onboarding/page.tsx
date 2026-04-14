import { Suspense } from "react";

import { DebugPanel } from "@/components/debug-panel";
import { GoDashboardButton } from "@/components/go-dashboard-button";
import { PrepareComplete } from "@/components/prepare-complete";
import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";

export default async function OnboardingPage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">onboarding target</div>
        <h1>Onboarding</h1>
        <p>
          This page now prepares cookie state <code>complete</code> on mount. The button still only
          calls <code>router.replace("/dashboard")</code>.
        </p>
      </div>

      <div className="stack-lg">
        <Suspense fallback={<div className="panel">Loading onboarding state...</div>}>
          <OnboardingContent />
        </Suspense>

        <div className="panel stack">
          <div>
            <h2 className="card-title">Expected behavior</h2>
            <div className="inline-list">
              <div>Stay on this page until the next state is prepared.</div>
              <div>
                Then the first <code>router.replace("/dashboard")</code> should land on{" "}
                <code>/complete</code>.
              </div>
            </div>
          </div>

          <div className="button-row">
            <GoDashboardButton label='router.replace("/dashboard")' />
            <ResetButton redirectTo="/" />
          </div>
        </div>
      </div>
    </main>
  );
}

async function OnboardingContent() {
  const state = await getReproState();

  return (
    <div className="stack">
      <DebugPanel label="onboarding target" serverState={state} />
      <PrepareComplete currentState={state} />
      <div className="panel panel-muted">
        current server state: <code>{state}</code>
      </div>
    </div>
  );
}
