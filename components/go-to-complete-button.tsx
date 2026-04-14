"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { prepareComplete } from "@/lib/actions";

type GoToCompleteButtonProps = {
  label?: string;
};

export function GoToCompleteButton({
  label = 'prepare complete, then router.replace("/dashboard")',
}: GoToCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      className="button"
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await prepareComplete();
          router.replace("/dashboard");
        });
      }}
    >
      {isPending ? "Preparing complete..." : label}
    </button>
  );
}
