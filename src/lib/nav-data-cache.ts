"use client";

// Shared client-side request deduplication & short TTL cache
// Prevents Navbar and BottomNavbar from firing duplicate API requests on every page load.

interface VisibilityFlags {
  teachersEnabled: boolean;
  awardsEnabled: boolean;
}

const VISIBILITY_TTL_MS = 60_000;
let visibilityCache: { data: VisibilityFlags; expiresAt: number } | null = null;
let visibilityInFlight: Promise<VisibilityFlags> | null = null;

export function fetchSiteVisibilityFlags(force = false): Promise<VisibilityFlags> {
  const now = Date.now();
  if (!force && visibilityCache && visibilityCache.expiresAt > now) {
    return Promise.resolve(visibilityCache.data);
  }
  if (!force && visibilityInFlight) {
    return visibilityInFlight;
  }

  visibilityInFlight = Promise.all([
    fetch("/api/teachers/status")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null),
    fetch("/api/awards/status")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null),
  ])
    .then(([teachersData, awardsData]: any[]) => {
      const data: VisibilityFlags = {
        teachersEnabled:
          teachersData && typeof teachersData.enabled === "boolean"
            ? teachersData.enabled
            : true,
        awardsEnabled:
          awardsData && typeof awardsData.enabled === "boolean"
            ? awardsData.enabled
            : true,
      };
      visibilityCache = { data, expiresAt: Date.now() + VISIBILITY_TTL_MS };
      return data;
    })
    .finally(() => {
      visibilityInFlight = null;
    });

  return visibilityInFlight;
}

const MISSING_TTL_MS = 45_000;
let missingCache: { key: string; count: number; expiresAt: number } | null = null;
let missingInFlight: { key: string; promise: Promise<number | null> } | null = null;

export function invalidateStudentMissingTasksCache(): void {
  missingCache = null;
}

export function fetchStudentMissingTasksCount(
  studentId: string,
  classroom: string,
  force = false
): Promise<number | null> {
  const cleanId = studentId.trim();
  const cleanRoom = classroom.trim();
  if (!cleanId) return Promise.resolve(null);

  const key = `${cleanId}|${cleanRoom}`;
  const now = Date.now();

  if (!force && missingCache && missingCache.key === key && missingCache.expiresAt > now) {
    return Promise.resolve(missingCache.count);
  }
  if (!force && missingInFlight && missingInFlight.key === key) {
    return missingInFlight.promise;
  }

  const promise = Promise.all([
    fetch(
      `/api/assignments?activeOnly=true&classroom=${encodeURIComponent(cleanRoom)}&studentId=${encodeURIComponent(cleanId)}`
    )
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
    fetch(`/api/submissions?studentId=${encodeURIComponent(cleanId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
  ])
    .then(([assList, subList]) => {
      if (!Array.isArray(assList)) return null;
      const subs = Array.isArray(subList) ? subList : [];
      const subMap = new Map<string, any>();
      for (const s of subs) {
        if (s?.assignmentId && !subMap.has(s.assignmentId)) {
          subMap.set(s.assignmentId, s);
        }
      }
      const missing = assList.filter(
        (a: any) => !subMap.has(a.id) || subMap.get(a.id)?.status === "resubmit"
      ).length;
      missingCache = { key, count: missing, expiresAt: Date.now() + MISSING_TTL_MS };
      return missing;
    })
    .catch(() => null)
    .finally(() => {
      if (missingInFlight?.key === key) {
        missingInFlight = null;
      }
    });

  missingInFlight = { key, promise };
  return promise;
}

