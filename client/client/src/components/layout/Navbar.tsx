import { useAuth } from "@/auth/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link to={user ? "/dashboard" : "/"} className="font-semibold">
            Health AI
          </Link>

          {!user && (
            <>
              <Link to="/login" className="text-sm text-zinc-700">
                Login
              </Link>
              <Link to="/register/patient" className="text-sm text-zinc-700">
                Patient Register
              </Link>
              <Link to="/register/doctor" className="text-sm text-zinc-700">
                Doctor Register
              </Link>
            </>
          )}

          {user?.role === "PATIENT" && (
            <>
              <Link to="/patient" className="text-sm text-zinc-700">
                Dashboard
              </Link>
              <Link to="/my-appointments" className="text-sm text-zinc-700">
                My Appointments
              </Link>
              <Link to="/medicines" className="text-sm text-zinc-700">
                Medicines
              </Link>
              <Link to="/cart" className="text-sm text-zinc-700">
                Cart
              </Link>
              <Link to="/orders" className="text-sm text-zinc-700">
                Orders
              </Link>
              <Link to="/ai-chat" className="text-sm text-zinc-700">
                AI Chat
              </Link>
            </>
          )}

          {user?.role === "DOCTOR" && (
            <>
              <Link to="/doctor" className="text-sm text-zinc-700">
                Dashboard
              </Link>
              {/* <Link to="/ai-chat" className="text-sm text-zinc-700">
                AI Chat
              </Link> */}
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link to="/admin" className="text-sm text-zinc-700">
                Dashboard
              </Link>
              <Link to="/admin/medicines" className="text-sm text-zinc-700">
                Medicines
              </Link>
              <Link to="/admin/orders" className="text-sm text-zinc-700">
                Orders
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-700">
              {user.email} ({user.role})
            </span>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
