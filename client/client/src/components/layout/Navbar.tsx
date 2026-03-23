import { useAuth } from "@/auth/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface NavLinkItem {
  to: string;
  label: string;
}

const PATIENT_LINKS: NavLinkItem[] = [
  { to: "/patient", label: "Dashboard" },
  { to: "/my-appointments", label: "Appointments" },
  { to: "/medicines", label: "Medicines" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
  { to: "/ai-chat", label: "AI chat" },
];

const DOCTOR_LINKS: NavLinkItem[] = [
  { to: "/doctor", label: "Dashboard" },
];

const ADMIN_LINKS: NavLinkItem[] = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/medicines", label: "Medicines" },
  { to: "/admin/orders", label: "Orders" },
];

const GUEST_LINKS: NavLinkItem[] = [
  { to: "/login", label: "Login" },
  { to: "/register/patient", label: "Patient register" },
  { to: "/register/doctor", label: "Doctor register" },
];

const ROLE_LINKS: Record<string, NavLinkItem[]> = {
  PATIENT: PATIENT_LINKS,
  DOCTOR: DOCTOR_LINKS,
  ADMIN: ADMIN_LINKS,
};

const ROLE_BADGE: Record<string, string> = {
  PATIENT: "bg-[#E1F5EE] text-[#085041]",
  DOCTOR: "bg-[#E6F1FB] text-[#0C447C]",
  ADMIN: "bg-[#FAECE7] text-[#712B13]",
};

const AVATAR_COLORS = [
  "bg-[#9FE1CB] text-[#085041]",
  "bg-[#F5C4B3] text-[#712B13]",
  "bg-[#CECBF6] text-[#3C3489]",
  "bg-[#B5D4F4] text-[#0C447C]",
];

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function NavItem({ to, label }: NavLinkItem) {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
        isActive
          ? "font-medium text-[#1D9E75]"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const links = user ? (ROLE_LINKS[user.role] ?? []) : GUEST_LINKS;
  const avatarColor =
    AVATAR_COLORS[
      user ? Object.keys(ROLE_LINKS).indexOf(user.role) % AVATAR_COLORS.length : 0
    ];

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="border-b border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 h-14">

        {/* Left — brand + links */}
        <div className="flex items-center gap-1">
          <Link
            to={user ? "/dashboard" : "/"}
            className="mr-3 font-serif italic text-[17px] text-zinc-900 tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Health AI
          </Link>

          {links.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        {/* Right — user info + logout */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar + meta */}
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-xs font-medium ${avatarColor}`}
              >
                {getInitials(user.email)}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-medium text-zinc-800">
                  {user.email}
                </span>
                <span
                  className={`mt-1 inline-block self-start rounded-full px-1.5 py-px text-[10px] font-medium ${
                    ROLE_BADGE[user.role] ?? "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-zinc-200" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}