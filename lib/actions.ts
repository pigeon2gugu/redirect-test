"use server";

import { clearReproState, setReproState } from "@/lib/state";

export async function prepareOnboarding() {
  await setReproState("onboarding");
}

export async function prepareComplete() {
  await setReproState("complete");
}

export async function resetReproState() {
  await clearReproState();
}
