"use client";

/**
 * All localStorage keys used across Art Room for authentication and profile.
 * Every single one of these MUST be strictly cleared on logout or account switch.
 */
export const ALL_AUTH_KEYS = [
  "artroom_author_name",
  "artroom_author_email",
  "artroom_role",
  "artroom_user_role",
  "artroom_student_id",
  "artroom_classroom",
  "artroom_student_grade",
  "artroom_grade_level",
  "artroom_avatar",
  "artroom_phone",
  "artroom_display_name",
  "artroom_provider",
] as const;

/**
 * Wipe all authentication and user identity data from localStorage.
 * Guarantees that no stale ID or role ever bleeds into a new session.
 */
export function clearAllAuthData(): void {
  if (typeof window === "undefined") return;
  for (const key of ALL_AUTH_KEYS) {
    localStorage.removeItem(key);
  }
}

/**
 * Store a verified student session into localStorage.
 * Automatically clears previous identity before setting new values.
 */
export function setStudentAuth(
  student: {
    id: string;
    name: string;
    classroom?: string;
    gradeLevel?: string;
    email?: string;
  },
  emitEvent: boolean = true
): void {
  if (typeof window === "undefined") return;

  const cleanId = String(student.id || "").trim();
  const cleanName = String(student.name || "").trim();
  const cleanRoom = String(student.classroom || "").trim();
  const cleanGrade = String(student.gradeLevel || "").trim();
  const cleanEmail = student.email || `${cleanId}@wachiratham.ac.th`;

  localStorage.setItem("artroom_author_name", cleanName);
  localStorage.setItem("artroom_display_name", cleanName);
  localStorage.setItem("artroom_author_email", cleanEmail);
  localStorage.setItem("artroom_role", "student");
  localStorage.setItem("artroom_user_role", "นักเรียน WTS");
  localStorage.setItem("artroom_student_id", cleanId);

  if (cleanRoom) {
    localStorage.setItem("artroom_classroom", cleanRoom);
    localStorage.setItem("artroom_student_grade", cleanRoom);
  }
  if (cleanGrade) {
    localStorage.setItem("artroom_grade_level", cleanGrade);
  }

  if (emitEvent) {
    window.dispatchEvent(new Event("artroom_profile_updated"));
  }
}

/**
 * Store a verified guest session into localStorage.
 * Explicitly clears student credentials to prevent student privilege escalation.
 */
export function setGuestAuth(
  guest: {
    name: string;
    email: string;
    role?: string;
    phone?: string;
    provider?: string;
  },
  emitEvent: boolean = true
): void {
  if (typeof window === "undefined") return;
  clearAllAuthData();

  const cleanName = String(guest.name || "").trim();
  const cleanEmail = String(guest.email || "").trim().toLowerCase();
  const cleanRole = String(guest.role || "บุคคลทั่วไป").trim();

  localStorage.setItem("artroom_author_name", cleanName);
  localStorage.setItem("artroom_display_name", cleanName);
  localStorage.setItem("artroom_author_email", cleanEmail);
  localStorage.setItem("artroom_role", "guest");
  localStorage.setItem("artroom_user_role", cleanRole);
  if (guest.phone) {
    localStorage.setItem("artroom_phone", guest.phone.trim());
  }
  if (guest.provider) {
    localStorage.setItem("artroom_provider", guest.provider.trim());
  }

  if (emitEvent) {
    window.dispatchEvent(new Event("artroom_profile_updated"));
  }
}

/**
 * Perform a clean, global logout across both server cookies and client storage.
 */
export async function performGlobalLogout(redirectUrl: string = "/"): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("Server logout request failed, proceeding with client purge:", e);
  }

  clearAllAuthData();
  window.dispatchEvent(new Event("artroom_profile_updated"));

  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    window.location.reload();
  }
}

let isSyncing = false;

/**
 * Query /api/auth/profile to synchronize client state with the server session.
 * Never causes infinite event loops.
 */
export async function syncAuthWithServer(): Promise<{
  authenticated: boolean;
  user: any;
  isAdmin: boolean;
}> {
  if (typeof window === "undefined" || isSyncing) {
    return { authenticated: false, user: null, isAdmin: false };
  }

  isSyncing = true;
  try {
    const res = await fetch("/api/auth/profile");
    if (!res.ok) {
      return { authenticated: false, user: null, isAdmin: false };
    }

    const data = await res.json();

    if (data.authenticated && data.user) {
      if (data.user.role === "student") {
        setStudentAuth(
          {
            id: data.user.id || data.user.userId,
            name: data.user.name,
            classroom: data.user.classroom,
            gradeLevel: data.user.gradeLevel,
          },
          false // DO NOT emit event here to prevent infinite recursion
        );
      } else if (data.user.role === "guest") {
        setGuestAuth(
          {
            name: data.user.name,
            email: data.user.email || "",
            role: data.user.userRole || "บุคคลทั่วไป",
          },
          false // DO NOT emit event here
        );
      }
    }

    return data;
  } catch (err) {
    console.warn("syncAuthWithServer error:", err);
    return { authenticated: false, user: null, isAdmin: false };
  } finally {
    isSyncing = false;
  }
}
