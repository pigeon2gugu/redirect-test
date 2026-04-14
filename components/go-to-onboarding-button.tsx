"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { prepareOnboarding } from "@/lib/actions";

type GoToOnboardingButtonProps = {
  label?: string;
};

export function GoToOnboardingButton({
  label = 'prepare onboarding, then router.replace("/dashboard")',
}: GoToOnboardingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      className="button"
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await prepareOnboarding();
          router.replace("/dashboard");
        });
      }}
    >
      {isPending ? "Preparing onboarding..." : label}
    </button>
  );
}
