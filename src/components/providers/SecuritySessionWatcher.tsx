"use client";

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
    // Skip checking on login and public landing pages if not logged in
    const isAdminArea = pathname?.startsWith("/admin") && pathname !== "/admin/login";

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
          const data = await res.json().catch(() => ({}));
          if (data.reason === "kicked" || isAdminArea) {
            isKickingRef.current = true;

            // Purge client state immediately
            try {
              localStorage.removeItem("artroom_role");
              localStorage.removeItem("artroom_author_name");
              localStorage.removeItem("artroom_user_role");
              localStorage.removeItem("artroom_author_email");
              localStorage.removeItem("artroom_avatar");
            } catch {}

            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

            // If in admin area, force redirect to admin login with kicked parameter
            if (isAdminArea) {
              alert("⚠️ เซสชันของคุณถูกเตะออกจากระบบโดยผู้ดูแลระบบ หรือรหัสผ่านมีการเปลี่ยนแปลง");
              window.location.href = "/admin/login?kicked=1";
            } else {
              window.dispatchEvent(new Event("artroom_profile_updated"));
              if (pathname?.startsWith("/me") || pathname?.startsWith("/submissions")) {
                alert("⚠️ เซสชันของคุณถูกออกจากระบบแล้ว");
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

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname, router]);

  return null;
}
