import Link from "next/link";

import { ResetButton } from "@/components/reset-button";
import { getReproState } from "@/lib/state";
import { Suspense } from "react";

export default async function HomePage() {
  return (
    <main className="page-shell">
      <div className="hero">
        <div className="eyebrow">cacheComponents repro</div>
        <h1>Minimal redirect test app</h1>
        <p>
          This app mirrors the real flow with four routes:{" "}
          <code>/dashboard</code>, <code>/verify-identity</code>,{" "}
          <code>/onboarding</code>, and <code>/complete</code>. Each target page
          prepares the next server state, and the button only performs{" "}
          <code>router.replace("/dashboard")</code>.
        </p>
      </div>

      <div className="panel stack">
        <div>
          <h2 className="card-title">Current state</h2>
          <div className="inline-list">
            <Suspense fallback={<div>Loading state...</div>}>
              <HomeContent />
            </Suspense>
            <div>
              expected first cycle:{" "}
              <code>
                /dashboard -&gt; /verify-identity -&gt; /dashboard -&gt;
                /onboarding -&gt; /dashboard -&gt; /complete
              </code>
            </div>
          </div>
        </div>

        <div className="button-row">
          <Link className="button" href="/dashboard" prefetch={false}>
            Open dashboard entry
          </Link>
          <ResetButton redirectTo="/" />
        </div>
      </div>
    </main>
  );
}

async function HomeContent() {
  const state = await getReproState();

  return (
    <div>
      cookie state: <code>{state}</code>
    </div>
  );
}
