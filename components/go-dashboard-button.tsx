"use client";

import { useRouter } from "next/navigation";

type GoDashboardButtonProps = {
  label?: string;
};

export function GoDashboardButton({
  label = 'router.replace("/dashboard")',
}: GoDashboardButtonProps) {
  const router = useRouter();

  return (
    <button
      className="button"
      type="button"
      onClick={() => {
        router.replace("/dashboard");
      }}
    >
      {label}
    </button>
  );
}
