import React from "react";
import type { Role } from "../types";
import { useAuth } from "./useAuth";
import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "./AuthProvider";

export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === "DOCTOR" && user.doctorProfile && !user.doctorProfile.verified) {
    return <div className="p-6">Doctor account pending admin verification.</div>;
  }

  return <>{children}</>;
}
