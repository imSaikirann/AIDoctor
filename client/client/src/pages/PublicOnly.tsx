import { useAuth } from "@/auth/useAuth";
import { Navigate } from "react-router-dom";
// import { useAuth } from "./useAuth";

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  if (user?.role === "PATIENT") return <Navigate to="/patient" replace />;
  if (user?.role === "DOCTOR") return <Navigate to="/doctor" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <>{children}</>;
}