import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Book", href: "/" },
  { label: "My Appointments", href: "/my-appointments" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          🩺 HealthAI
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.href;

            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "font-medium",
                    active && "shadow-sm"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}