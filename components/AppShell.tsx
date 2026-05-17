"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { AppSidebar, type SidebarUser } from "@/components/AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = (await response.json()) as { user: SidebarUser | null };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = (await response.json()) as { user: SidebarUser | null };
        setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    function handleUserUpdate(event: Event) {
      const detail = (event as CustomEvent<{ user: SidebarUser | null }>).detail;
      if (detail && "user" in detail) {
        setUser(detail.user);
        setLoading(false);
      } else {
        void loadUser();
      }
    }

    window.addEventListener("matheye:user-updated", handleUserUpdate);
    return () => {
      active = false;
      window.removeEventListener("matheye:user-updated", handleUserUpdate);
    };
  }, [loadUser]);

  useEffect(() => {
    if (pathname === "/" && user) {
      router.replace("/courses");
    }
  }, [pathname, router, user]);

  const isGuestPublicPage = !user && (pathname === "/" || pathname.startsWith("/auth"));

  return (
    <div className={`app-layout ${isGuestPublicPage ? "public-layout" : ""}`}>
      {isGuestPublicPage ? null : <AppSidebar loading={loading} onUserChange={setUser} user={user} />}
      <div className="app-content">{children}</div>
    </div>
  );
}
