import { useAuth } from "@/auth/useAuth";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
// import { Button } from "./ui/button";
// import { useAuth } from "../auth/AuthProvider";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold">Health AI</Link>
          {!user ? (
            <>
              <Link to="/login" className="text-sm text-zinc-700">Login</Link>
              <Link to="/register/patient" className="text-sm text-zinc-700">Patient Register</Link>
              <Link to="/register/doctor" className="text-sm text-zinc-700">Doctor Register</Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-700">{user.email} ({user.role})</span>
              <Button variant="outline" onClick={() => logout().catch(() => {})}>Logout</Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}