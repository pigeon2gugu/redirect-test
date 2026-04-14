import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getReproState } from "@/lib/state";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="page-shell">Loading dashboard route...</main>}>
      <DashboardRoutes />
    </Suspense>
  );
}

async function DashboardRoutes(): Promise<React.ReactNode> {
  const state = await getReproState();

  if (state === "verify") {
    redirect("/verify-identity");
  }

  if (state === "onboarding") {
    redirect("/onboarding");
  }

  return redirect("/complete");
}
