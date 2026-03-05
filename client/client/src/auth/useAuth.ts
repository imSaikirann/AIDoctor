import { useContext } from "react";
import { AuthCtx } from "./auth-context";
import type { AuthState } from "./auth-context";

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}