"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import StudentAccessGuard from "@/components/auth/StudentAccessGuard";
import { syncAuthWithServer } from "@/lib/client-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  studentOnly?: boolean;
}

export default function ProtectedRoute({ children, studentOnly = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // If it's a student-only route, let StudentAccessGuard handle the entire verification & in-page card
    if (studentOnly) {
      setIsChecking(false);
      return;
    }

    // For general protected routes (e.g. /ideas/new):
    const verifyAuth = async () => {
      try {
        const serverAuth = await syncAuthWithServer();
        if (serverAuth.authenticated && serverAuth.user) {
          setIsLoggedIn(true);
          setIsChecking(false);
          return;
        }

        const localAuthor = localStorage.getItem("artroom_author_name");
        const localRole = localStorage.getItem("artroom_role");
        if (localAuthor && (localRole === "student" || localRole === "guest" || localRole === "admin" || localRole === "teacher")) {
          setIsLoggedIn(true);
          setIsChecking(false);
          return;
        }

        // Not authenticated -> redirect to /login with return path
        const q = typeof window !== "undefined" && window.location.search ? window.location.search.replace(/^\?/, "") : "";
        const target = q ? `${pathname}?${q}` : pathname;
        router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      } catch (err) {
        console.error("ProtectedRoute auth error:", err);
        const q = typeof window !== "undefined" && window.location.search ? window.location.search.replace(/^\?/, "") : "";
        const target = q ? `${pathname}?${q}` : pathname;
        router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [pathname, studentOnly, router]);

  // If student-only, delegate directly to StudentAccessGuard
  if (studentOnly) {
    return <StudentAccessGuard>{children}</StudentAccessGuard>;
  }

  // While checking general auth
  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  // If general auth passed (logged in as student or guest)
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return null;
}

