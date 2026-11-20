"use client";

import { swalAlert } from "@/lib/swal";
import { clearAllAuthData } from "@/lib/client-auth";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * SecuritySessionWatcher
 * Real-time client-side heartbeat watcher.
 * Continuously polls /api/auth/session-check every 3-4 seconds.
 * When an active device is kicked/revoked by an admin, this watcher IMMEDIATELY
 * purges client storage/cookies and redirects the kicked device to the login page.
 */
export default function SecuritySessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const isKickingRef = useRef(false);

  useEffect(() => {
    // Skip checking on login pages so stale cookies never interfere with a fresh sign-in
    if (pathname === "/login" || pathname === "/admin/login") {
      isKickingRef.current = false;
      return;
    }

    const isAdminArea = pathname?.startsWith("/admin");

    const checkSession = async () => {
      if (isKickingRef.current) return;

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

            // Purge client state immediately
            try {
              clearAllAuthData();
            } catch {}

            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

            // If in admin area, force redirect to admin login with kicked parameter
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
      } catch (err) {
        // Network glitches are ignored gracefully
      }
    };

    // Fast check on mount and on window focus
    checkSession();

    // Heartbeat check every 3.5 seconds
    const interval = setInterval(checkSession, 3500);

    const onFocus = () => {
      checkSession();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
