import { GoToCompleteButton } from "@/components/go-to-complete-button";
import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";
import { Suspense } from "react";

export default async function OnboardingPage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">onboarding target</div>
        <h1>Onboarding</h1>
        <p>
          This page represents the second gated target. The button prepares
          cookie state
          <code>complete</code>, then calls{" "}
          <code>router.replace("/dashboard")</code>.
        </p>
      </div>
      <div className="stack-lg">
        <Suspense fallback={<div>Loading state...</div>}>
          <OnboardingContent />
        </Suspense>
        <div className="panel stack">
          <div>
            <h2 className="card-title">Expected behavior</h2>
            <div className="inline-list">
              <div>
                The first <code>router.replace("/dashboard")</code> should land
                on
                <code>/complete</code>.
              </div>
            </div>
          </div>

          <div className="button-row">
            <GoToCompleteButton />
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
    <div className="panel panel-muted">
      current server state: <code>{state}</code>
    </div>
  );
}
