"use client";

import { useEffect, useState, useTransition } from "react";

import { prepareOnboarding } from "@/lib/actions";
import type { ReproState } from "@/lib/state";

type PrepareOnboardingProps = {
  currentState: ReproState;
};

export function PrepareOnboarding({ currentState }: PrepareOnboardingProps) {
  const [isPending, startTransition] = useTransition();
  const [hasPrepared, setHasPrepared] = useState(currentState === "onboarding");

  useEffect(() => {
    if (currentState === "onboarding") {
      setHasPrepared(true);
      return;
    }

    startTransition(() => {
      void prepareOnboarding().then(() => {
        setHasPrepared(true);
      });
    });
  }, [currentState]);

  return (
    <div className="prepare-panel">
      <strong>Prepare Next State</strong>
      <div>
        currentState at render: <code>{currentState}</code>
      </div>
      <div>
        nextState to prepare: <code>onboarding</code>
      </div>
      <div>
        status: <code>{hasPrepared ? "ready" : isPending ? "preparing" : "waiting"}</code>
      </div>
    </div>
  );
}
