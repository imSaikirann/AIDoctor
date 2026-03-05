import React from "react";
import type { Role } from "../types";
import { useAuth } from "./useAuth";
// import { useAuth } from "./AuthProvider";

export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  if (role && user.role !== role) return <div className="p-6">Forbidden</div>;

  if (user.role === "DOCTOR" && user.doctorProfile && !user.doctorProfile.verified) {
    return <div className="p-6">Doctor account pending admin verification.</div>;
  }

  return <>{children}</>;
}