"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { resetReproState } from "@/lib/actions";

const SESSION_KEYS = [
  "__redirect_test_mount_seq",
  "__redirect_test_event_seq",
  "__redirect_test_recent_events",
];

type ResetButtonProps = {
  redirectTo?: string;
};

export function ResetButton({ redirectTo = "/" }: ResetButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button button-secondary"
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          void resetReproState().then(() => {
            for (const key of SESSION_KEYS) {
              sessionStorage.removeItem(key);
            }

            router.replace(redirectTo);
          });
        });
      }}
    >
      {isPending ? "Resetting..." : "Reset cookie and restart"}
    </button>
  );
}
