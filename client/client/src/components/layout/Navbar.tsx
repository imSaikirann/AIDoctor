import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { Role } from "@/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavLinkItem {
  to: string;
  labelKey: string;
}

const PATIENT_LINKS: NavLinkItem[] = [
  { to: "/patient", labelKey: "navbar.dashboard" },
  { to: "/medical-records", labelKey: "navbar.medicalRecords" },
  { to: "/my-appointments", labelKey: "navbar.appointments" },
  { to: "/medicines", labelKey: "navbar.medicines" },
  { to: "/cart", labelKey: "navbar.cart" },
  { to: "/orders", labelKey: "navbar.orders" },
  { to: "/ai-chat", labelKey: "navbar.aiChat" },
];

const DOCTOR_LINKS: NavLinkItem[] = [
  { to: "/doctor", labelKey: "navbar.dashboard" },
  { to: "/medical-records", labelKey: "navbar.medicalRecords" },
];

const ADMIN_LINKS: NavLinkItem[] = [
  { to: "/admin", labelKey: "navbar.dashboard" },
  { to: "/admin/medicines", labelKey: "navbar.medicines" },
  { to: "/admin/orders", labelKey: "navbar.orders" },
];

const GUEST_LINKS: NavLinkItem[] = [
  { to: "/login", labelKey: "navbar.login" },
  { to: "/register/patient", labelKey: "navbar.patientRegister" },
  { to: "/register/doctor", labelKey: "navbar.doctorRegister" },
];

const ROLE_LINKS: Record<Role, NavLinkItem[]> = {
  PATIENT: PATIENT_LINKS,
  DOCTOR: DOCTOR_LINKS,
  ADMIN: ADMIN_LINKS,
};

const ROLE_BADGE: Record<Role, string> = {
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

function NavItem({ to, labelKey }: NavLinkItem) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
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
      {t(labelKey)}
    </Link>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const links = user ? ROLE_LINKS[user.role] ?? [] : GUEST_LINKS;
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
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <Link
            to={user ? "/dashboard" : "/"}
            className="mr-3 font-serif italic text-[17px] tracking-tight text-zinc-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {t("navbar.brand")}
          </Link>

          {links.map((link) => (
            <NavItem key={link.to} to={link.to} labelKey={link.labelKey} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />

          {user && (
            <>
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
                    {t(`navbar.roles.${user.role}`)}
                  </span>
                </div>
              </div>

              <div className="h-4 w-px bg-zinc-200" />

              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-200 bg-transparent px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
              >
                {t("navbar.signOut")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
