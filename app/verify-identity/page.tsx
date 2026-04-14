import { Suspense } from "react";

import { DebugPanel } from "@/components/debug-panel";
import { GoDashboardButton } from "@/components/go-dashboard-button";
import { PrepareOnboarding } from "@/components/prepare-onboarding";
import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";

export default async function VerifyIdentityPage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">verify target</div>
        <h1>Verify identity</h1>
        <p>
          This page prepares cookie state <code>onboarding</code> on mount. The button only calls{" "}
          <code>router.replace("/dashboard")</code>.
        </p>
      </div>

      <div className="stack-lg">
        <Suspense fallback={<div className="panel">Loading verify state...</div>}>
          <VerifyContent />
        </Suspense>

        <div className="panel stack">
          <div>
            <h2 className="card-title">Expected behavior</h2>
            <div className="inline-list">
              <div>Stay on this page until the next state is prepared.</div>
              <div>
                Then the first <code>router.replace("/dashboard")</code> should land on{" "}
                <code>/onboarding</code>.
              </div>
            </div>
          </div>

          <div className="button-row">
            <GoDashboardButton />
            <ResetButton redirectTo="/" />
          </div>
        </div>
      </div>
    </main>
  );
}

async function VerifyContent() {
  const state = await getReproState();

  return (
    <div className="stack">
      <DebugPanel label="verify target" serverState={state} />
      <PrepareOnboarding currentState={state} />
      <div className="panel panel-muted">
        current server state: <code>{state}</code>
      </div>
    </div>
  );
}
