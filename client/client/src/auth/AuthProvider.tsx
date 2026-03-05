import React, { useEffect, useMemo, useState } from "react";
import { apiLogout, apiMe } from "../api/auth";
import { AuthCtx, type AuthState } from "./auth-context";
import type { User } from "../types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await apiMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };

    init().catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, refresh, logout }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}