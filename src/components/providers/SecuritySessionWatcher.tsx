"use client";

import { swalAlert } from "@/lib/swal";
import { clearAllAuthData } from "@/lib/client-auth";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * SecuritySessionWatcher
 * Client-side session heartbeat watcher.
 * - Skips polling completely for logged-out visitors on public pages (zero wasted API calls).
 * - Polls every 30s on /admin and every 45s for logged-in users when the tab is visible.
 * - Immediately kicks/purges client state if an admin revokes the session.
 */
export default function SecuritySessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const isKickingRef = useRef(false);
  const lastCheckAtRef = useRef(0);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/admin/login") {
      isKickingRef.current = false;
      return;
    }

    const isAdminArea = Boolean(pathname?.startsWith("/admin"));

    const hasLocalAuth = () => {
      try {
        return Boolean(
          localStorage.getItem("artroom_role") ||
          localStorage.getItem("artroom_student_id") ||
          localStorage.getItem("artroom_author_name") ||
          document.cookie.includes("admin_token=") ||
          document.cookie.includes("session_token=")
        );
      } catch {
        return false;
      }
    };

    const checkSession = async (force = false) => {
      if (isKickingRef.current) return;
      if (!isAdminArea && !hasLocalAuth()) return;
      if (!force && document.visibilityState !== "visible") return;

      const now = Date.now();
      // Throttle burst checks (e.g., focus + visibilitychange firing together)
      if (!force && now - lastCheckAtRef.current < 10_000) return;
      lastCheckAtRef.current = now;

      try {
        const query = isAdminArea ? "?role=admin" : "";
        const res = await fetch(`/api/auth/session-check${query}`, {
          method: "GET",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (res.status === 401) {
          const data: any = await res.json().catch(() => ({}));
          if (data.reason === "kicked" || isAdminArea) {
            isKickingRef.current = true;

            try {
              clearAllAuthData();
            } catch {}

            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

            if (isAdminArea) {
              await swalAlert("⚠️ เซสชันของคุณถูกเตะออกจากระบบโดยผู้ดูแลระบบ หรือรหัสผ่านมีการเปลี่ยนแปลง");
              window.location.href = "/admin/login?kicked=1";
            } else {
              window.dispatchEvent(new Event("artroom_profile_updated"));
              if (pathname?.startsWith("/me") || pathname?.startsWith("/submissions")) {
                await swalAlert("⚠️ เซสชันของคุณถูกออกจากระบบแล้ว");
                window.location.href = "/login?kicked=1";
              }
            }
          }
        }
      } catch {
        // Network glitches are ignored gracefully
      }
    };

    // Initial check only if in admin area or logged in locally
    if (isAdminArea || hasLocalAuth()) {
      checkSession(true);
    }

    const pollMs = isAdminArea ? 30_000 : 45_000;
    const interval = setInterval(() => checkSession(false), pollMs);

    const onFocus = () => {
      checkSession(false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession(false);
      }
    };

    const onProfileUpdated = () => {
      if (hasLocalAuth()) {
        checkSession(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("artroom_profile_updated", onProfileUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("artroom_profile_updated", onProfileUpdated);
    };
  }, [pathname, router]);

  return null;
}
