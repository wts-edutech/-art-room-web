"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Upload,
  Trophy,
  User,
  Users,
  LogIn,
  Info,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  matchPaths: string[];
}

function getNavItems(role: string | null): NavItem[] {
  if (role === "student") {
    return [
      {
        label: "หน้าแรก",
        href: "/",
        icon: <Home className="w-5 h-5" />,
        matchPaths: ["/"],
      },
      {
        label: "สื่อการสอน",
        href: "/materials",
        icon: <BookOpen className="w-5 h-5" />,
        matchPaths: ["/materials"],
      },
      {
        label: "ส่งงาน",
        href: "/submissions",
        icon: <Upload className="w-5 h-5" />,
        matchPaths: ["/submissions", "/submit-work"],
      },
      {
        label: "ผลงาน",
        href: "/artworks",
        icon: <Trophy className="w-5 h-5" />,
        matchPaths: ["/artworks", "/awards"],
      },
      {
        label: "ฉัน",
        href: "/me",
        icon: <User className="w-5 h-5" />,
        matchPaths: ["/me", "/profile"],
      },
    ];
  }

  if (role === "teacher" || role === "admin") {
    return [
      {
        label: "หน้าแรก",
        href: "/",
        icon: <Home className="w-5 h-5" />,
        matchPaths: ["/"],
      },
      {
        label: "นักเรียน",
        href: "/admin",
        icon: <Users className="w-5 h-5" />,
        matchPaths: ["/admin"],
      },
      {
        label: "สื่อการสอน",
        href: "/materials",
        icon: <BookOpen className="w-5 h-5" />,
        matchPaths: ["/materials"],
      },
      {
        label: "ผลงาน",
        href: "/artworks",
        icon: <Trophy className="w-5 h-5" />,
        matchPaths: ["/artworks", "/awards"],
      },
      {
        label: "ฉัน",
        href: "/me",
        icon: <User className="w-5 h-5" />,
        matchPaths: ["/me", "/profile"],
      },
    ];
  }

  // guest / not logged in
  return [
    {
      label: "หน้าแรก",
      href: "/",
      icon: <Home className="w-5 h-5" />,
      matchPaths: ["/"],
    },
    {
      label: "สื่อการสอน",
      href: "/materials",
      icon: <BookOpen className="w-5 h-5" />,
      matchPaths: ["/materials"],
    },
    {
      label: "ผลงาน",
      href: "/artworks",
      icon: <Trophy className="w-5 h-5" />,
      matchPaths: ["/artworks", "/awards"],
    },
    {
      label: "เกี่ยวกับ",
      href: "/contact",
      icon: <Info className="w-5 h-5" />,
      matchPaths: ["/contact", "/news", "/activities", "/teachers"],
    },
    {
      label: "เข้าสู่ระบบ",
      href: "/login",
      icon: <LogIn className="w-5 h-5" />,
      matchPaths: ["/login"],
    },
  ];
}

function isActive(pathname: string, matchPaths: string[]): boolean {
  if (matchPaths.includes("/")) {
    return pathname === "/";
  }
  return matchPaths.some((p) => pathname.startsWith(p));
}

export default function BottomNavbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateRole = () => {
      setRole(localStorage.getItem("artroom_role"));
    };
    updateRole();
    window.addEventListener("artroom_profile_updated", updateRole);
    window.addEventListener("storage", updateRole);
    return () => {
      window.removeEventListener("artroom_profile_updated", updateRole);
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  // Hide on admin pages and login page (admin has its own nav)
  if (pathname?.startsWith("/admin")) return null;
  if (!mounted) return null;

  const items = getNavItems(role);

  return (
    <nav
      className="bottom-nav fixed bottom-0 inset-x-0 z-[90] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Container: full width on mobile, centered on tablet */}
      <div className="mx-auto sm:max-w-[480px] bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:border sm:border-gray-200/80 sm:rounded-t-2xl sm:shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-around h-14">
          {items.map((item) => {
            const active = isActive(pathname, item.matchPaths);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full gap-0.5 transition-colors duration-150 active:scale-95 ${
                  active
                    ? "text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center ${
                    active ? "scale-110" : ""
                  } transition-transform duration-150`}
                >
                  {item.icon}
                  {active && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </div>
                <span
                  className={`bottom-nav-label text-[10px] leading-tight truncate max-w-full px-0.5 ${
                    active ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
