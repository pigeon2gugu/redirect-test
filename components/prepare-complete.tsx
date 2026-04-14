"use client";

import { useEffect, useState, useTransition } from "react";

import { prepareComplete } from "@/lib/actions";
import type { ReproState } from "@/lib/state";

type PrepareCompleteProps = {
  currentState: ReproState;
};

export function PrepareComplete({ currentState }: PrepareCompleteProps) {
  const [isPending, startTransition] = useTransition();
  const [hasPrepared, setHasPrepared] = useState(currentState === "complete");

  useEffect(() => {
    if (currentState === "complete") {
      setHasPrepared(true);
      return;
    }

    startTransition(() => {
      void prepareComplete().then(() => {
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
        nextState to prepare: <code>complete</code>
      </div>
      <div>
        status: <code>{hasPrepared ? "ready" : isPending ? "preparing" : "waiting"}</code>
      </div>
    </div>
  );
}
