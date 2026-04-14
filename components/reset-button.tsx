"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { resetReproState } from "@/lib/actions";

type ResetButtonProps = {
  redirectTo?: string;
  label?: string;
};

export function ResetButton({
  redirectTo = "/",
  label = "Reset cookie and restart",
}: ResetButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="button button-secondary"
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await resetReproState();
          router.replace(redirectTo);
        });
      }}
    >
      {isPending ? "Resetting..." : label}
    </button>
  );
}
