import { cookies } from "next/headers";

export const reproStates = ["verify", "onboarding", "complete"] as const;

export type ReproState = (typeof reproStates)[number];

const COOKIE_KEY = "__redirect_test_state";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60,
};

function isReproState(value: string | undefined): value is ReproState {
  return value !== undefined && reproStates.includes(value as ReproState);
}

export async function getReproState(): Promise<ReproState> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_KEY)?.value;

  return isReproState(value) ? value : "verify";
}

export async function setReproState(state: ReproState) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEY, state, cookieOptions);
}

export async function clearReproState() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEY, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}
