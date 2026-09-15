"use client";

export interface BookmarkedMaterial {
  id: string;
  title: string;
  description?: string;
  category?: string;
  topic?: string;
  grade?: string;
  mediaType?: "pdf" | "video" | "canva" | "image" | string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  rawId?: string;
  savedAt: string;
}

export interface BookmarkedIdea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  authorName: string;
  coverImageUrl?: string;
  savedAt: string;
}

const MATERIALS_KEY = "artroom_saved_materials";
const IDEAS_KEY = "artroom_saved_ideas";
export const BOOKMARKS_EVENT = "artroom_bookmarks_updated";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BOOKMARKS_EVENT));
  }
}

// ==========================================
// Materials Bookmarking
// ==========================================
export function getBookmarkedMaterials(): BookmarkedMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MATERIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading saved materials:", e);
    return [];
  }
}

export function isMaterialBookmarked(id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  const list = getBookmarkedMaterials();
  return list.some((item) => item.id === id || (item.rawId && item.rawId === id));
}

export function toggleMaterialBookmark(item: Partial<BookmarkedMaterial> & { id: string; title: string }): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getBookmarkedMaterials();
    const existingIndex = list.findIndex(
      (m) => m.id === item.id || (item.rawId && m.rawId === item.rawId)
    );

    let isSavedNow = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isSavedNow = false;
    } else {
      list.unshift({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        topic: item.topic,
        grade: item.grade,
        mediaType: item.mediaType,
        imageUrl: item.imageUrl,
        fileUrl: item.fileUrl,
        fileName: item.fileName,
        rawId: item.rawId,
        savedAt: new Date().toISOString(),
      });
      isSavedNow = true;
    }

    localStorage.setItem(MATERIALS_KEY, JSON.stringify(list));
    notifyChange();
    return isSavedNow;
  } catch (e) {
    console.error("Error toggling material bookmark:", e);
    return false;
  }
}

export function removeMaterialBookmark(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getBookmarkedMaterials().filter(
      (m) => m.id !== id && m.rawId !== id
    );
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(list));
    notifyChange();
  } catch (e) {
    console.error("Error removing material bookmark:", e);
  }
}

// ==========================================
// Ideas Bookmarking
// ==========================================
export function getBookmarkedIdeas(): BookmarkedIdea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading saved ideas:", e);
    return [];
  }
}

export function isIdeaBookmarked(id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  const list = getBookmarkedIdeas();
  return list.some((item) => item.id === id);
}

export function toggleIdeaBookmark(item: Partial<BookmarkedIdea> & { id: string; title: string; authorName: string }): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getBookmarkedIdeas();
    const existingIndex = list.findIndex((m) => m.id === item.id);

    let isSavedNow = false;
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      isSavedNow = false;
    } else {
      list.unshift({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        authorName: item.authorName,
        coverImageUrl: item.coverImageUrl,
        savedAt: new Date().toISOString(),
      });
      isSavedNow = true;
    }

    localStorage.setItem(IDEAS_KEY, JSON.stringify(list));
    notifyChange();
    return isSavedNow;
  } catch (e) {
    console.error("Error toggling idea bookmark:", e);
    return false;
  }
}

export function removeIdeaBookmark(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getBookmarkedIdeas().filter((m) => m.id !== id);
    localStorage.setItem(IDEAS_KEY, JSON.stringify(list));
    notifyChange();
  } catch (e) {
    console.error("Error removing idea bookmark:", e);
  }
}
