"use client";

import { BookOpen, Eye, Gauge, LogIn, LogOut, Settings, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export type SidebarUser = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  user: SidebarUser | null;
  loading: boolean;
  onUserChange: (user: SidebarUser | null) => void;
};

const navItems = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: Gauge },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ user, loading, onUserChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingLogout, setPendingLogout] = useState(false);

  async function logout() {
    setPendingLogout(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onUserChange(null);
      window.dispatchEvent(new CustomEvent("matheye:user-updated", { detail: { user: null } }));
      router.push("/");
      router.refresh();
    } finally {
      setPendingLogout(false);
    }
  }

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-top">
        <Link href={user ? "/courses" : "/"} className="brand" aria-label="Matheye home">
          <span className="brand-mark">
            <Eye size={20} />
          </span>
          <span>Matheye</span>
        </Link>

        <div className="sidebar-profile">
          <span className="profile-avatar">
            <UserRound size={18} />
          </span>
          <span className="profile-copy">
            <strong>{loading ? "Loading" : user?.name || "Guest"}</strong>
            <span>{user?.email || "Sign in to save progress"}</span>
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href === "/courses" && pathname.startsWith("/courses/"));
          return (
            <Link className={`sidebar-link ${active ? "active" : ""}`} href={item.href} key={item.href}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-actions">
        {user ? (
          <button className="btn btn-ghost sidebar-button" disabled={pendingLogout} onClick={logout} type="button">
            <LogOut size={16} />
            {pendingLogout ? "Logging out..." : "Log out"}
          </button>
        ) : (
          <>
            <Link className="btn btn-ghost sidebar-button" href="/auth">
              <LogIn size={16} />
              Log in
            </Link>
            <Link className="btn btn-primary sidebar-button" href="/auth?mode=signup">
              <UserPlus size={16} />
              Sign up
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
