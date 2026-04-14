import { Suspense } from "react";

import { DebugPanel } from "@/components/debug-panel";
import { GoDashboardButton } from "@/components/go-dashboard-button";
import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";

export default async function CompletePage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">complete target</div>
        <h1>Complete</h1>
        <p>
          This is the terminal target after <code>verify -&gt; onboarding -&gt; complete</code>.
        </p>
      </div>

      <div className="stack-lg">
        <Suspense fallback={<div className="panel">Loading complete state...</div>}>
          <CompleteContent />
        </Suspense>

        <div className="panel stack">
          <div>
            <h2 className="card-title">Controls</h2>
            <div className="inline-list">
              <div>
                <code>Go to dashboard again</code> should keep routing back here while the cookie
                state remains <code>complete</code>.
              </div>
              <div>Use reset to restart the cycle from <code>verify</code>.</div>
            </div>
          </div>

          <div className="button-row">
            <GoDashboardButton label='Go to dashboard again' />
            <ResetButton redirectTo="/" />
          </div>
        </div>
      </div>
    </main>
  );
}

async function CompleteContent() {
  const state = await getReproState();

  return (
    <div className="stack">
      <DebugPanel label="complete target" serverState={state} />
      <div className="panel panel-muted">
        current server state: <code>{state}</code>
      </div>
    </div>
  );
}
