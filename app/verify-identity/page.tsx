import { GoToOnboardingButton } from "@/components/go-to-onboarding-button";
import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";
import { Suspense } from "react";

export default async function VerifyIdentityPage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">verify target</div>
        <h1>Verify identity</h1>
        <p>
          This page represents the first gated target. The button prepares
          cookie state
          <code>onboarding</code>, then calls{" "}
          <code>router.replace("/dashboard")</code>.
        </p>
      </div>
      <div className="stack-lg">
        <Suspense fallback={<div>Loading state...</div>}>
          <VerifyContent />
        </Suspense>
        <div className="panel stack">
          <div>
            <h2 className="card-title">Expected behavior</h2>
            <div className="inline-list">
              <div>
                The first <code>router.replace("/dashboard")</code> should land
                on
                <code>/onboarding</code>.
              </div>
            </div>
          </div>
          <div className="button-row">
            <GoToOnboardingButton />
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
    <div className="panel panel-muted">
      current server state: <code>{state}</code>
    </div>
  );
}
