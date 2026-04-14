"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type DebugPanelProps = {
  label: string;
  serverState: string;
};

type DebugEvent = {
  seq: number;
  kind: "effect-setup" | "effect-cleanup" | "snapshot";
  mountId: number;
  effectCycle: number;
  label: string;
  path: string;
  serverState: string;
};

const MOUNT_KEY = "__redirect_test_mount_seq";
const EVENT_SEQ_KEY = "__redirect_test_event_seq";
const EVENTS_KEY = "__redirect_test_recent_events";

function nextCounter(key: string) {
  const nextValue = Number(sessionStorage.getItem(key) ?? "0") + 1;

  sessionStorage.setItem(key, String(nextValue));
  return nextValue;
}

function readRecentEvents(): DebugEvent[] {
  const raw = sessionStorage.getItem(EVENTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DebugEvent[]) : [];
  } catch {
    return [];
  }
}

function appendDebugEvent(event: Omit<DebugEvent, "seq">) {
  const nextEvent = {
    seq: nextCounter(EVENT_SEQ_KEY),
    ...event,
  } satisfies DebugEvent;
  const updatedEvents = [...readRecentEvents(), nextEvent].slice(-8);

  sessionStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
  return updatedEvents;
}

export function DebugPanel({ label, serverState }: DebugPanelProps) {
  const pathname = usePathname();
  const renderCount = useRef(0);
  const mountIdRef = useRef<number | null>(null);
  const effectCycleRef = useRef(0);
  const cleanupCountRef = useRef(0);
  const [mountId, setMountId] = useState<number | null>(null);
  const [effectCycles, setEffectCycles] = useState(0);
  const [cleanupCount, setCleanupCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState<DebugEvent[]>([]);

  renderCount.current += 1;

  useEffect(() => {
    if (mountIdRef.current === null) {
      mountIdRef.current = nextCounter(MOUNT_KEY);
    }

    effectCycleRef.current += 1;

    const updatedEvents = appendDebugEvent({
      kind: "effect-setup",
      mountId: mountIdRef.current,
      effectCycle: effectCycleRef.current,
      label,
      path: pathname,
      serverState,
    });

    setMountId(mountIdRef.current);
    setEffectCycles(effectCycleRef.current);
    setCleanupCount(cleanupCountRef.current);
    setRecentEvents(updatedEvents);

    return () => {
      if (mountIdRef.current === null) {
        return;
      }

      cleanupCountRef.current += 1;
      appendDebugEvent({
        kind: "effect-cleanup",
        mountId: mountIdRef.current,
        effectCycle: effectCycleRef.current,
        label,
        path: pathname,
        serverState,
      });
    };
  }, [label, pathname, serverState]);

  useEffect(() => {
    if (mountIdRef.current === null) {
      return;
    }

    const updatedEvents = appendDebugEvent({
      kind: "snapshot",
      mountId: mountIdRef.current,
      effectCycle: effectCycleRef.current,
      label,
      path: pathname,
      serverState,
    });

    setMountId(mountIdRef.current);
    setEffectCycles(effectCycleRef.current);
    setCleanupCount(cleanupCountRef.current);
    setRecentEvents(updatedEvents);
  }, [label, pathname, serverState]);

  return (
    <div className="debug-panel">
      <strong>Repro Debug</strong>
      <div>
        label: <code>{label}</code>
      </div>
      <div>
        path: <code>{pathname}</code>
      </div>
      <div>
        serverState: <code>{serverState}</code>
      </div>
      <div>
        mountId: <code>{mountId ?? "mounting"}</code>
      </div>
      <div>
        renderCount: <code>{renderCount.current}</code>
      </div>
      <div>
        effectCycles: <code>{effectCycles}</code>
      </div>
      <div>
        cleanupCount: <code>{cleanupCount}</code>
      </div>
      <div className="recent-events">
        {recentEvents.map((event) => (
          <div key={event.seq}>
            <code>
              #{event.seq} {event.kind} m{event.mountId} e{event.effectCycle} {event.label}{" "}
              {event.path} state={event.serverState}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
