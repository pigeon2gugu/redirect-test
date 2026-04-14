"use client";

import { useRouter } from "next/navigation";

type GoToDashboardButtonProps = {
  label?: string;
};

export function GoToDashboardButton({
  label = 'router.replace("/dashboard")',
}: GoToDashboardButtonProps) {
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
