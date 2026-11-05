"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface MascotSettings {
  mascotUrl: string;
  mascotAlt: string;
  size: number;
  showTooltip: boolean;
  tooltipText: string;
  updatedAt?: string;
}

export const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  mascotUrl: "/images/artroom-mascot-transparent.png",
  mascotAlt: "Art Room Mascot Back to Top",
  size: 64,
  showTooltip: true,
  tooltipText: "ขึ้นด้านบน",
};

interface MascotContextType {
  mascotSettings: MascotSettings;
  isLoading: boolean;
  resolvedMascotSrc: string;
  updateLocalSettings: (settings: Partial<MascotSettings>) => void;
  refreshMascotSettings: () => Promise<void>;
}

const MascotContext = createContext<MascotContextType>({
  mascotSettings: DEFAULT_MASCOT_SETTINGS,
  isLoading: true,
  resolvedMascotSrc: DEFAULT_MASCOT_SETTINGS.mascotUrl,
  updateLocalSettings: () => {},
  refreshMascotSettings: async () => {},
});

const STORAGE_KEY = "artroom_site_mascot_settings";

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [mascotSettings, setMascotSettings] = useState<MascotSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return { ...DEFAULT_MASCOT_SETTINGS, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_MASCOT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);

  const refreshMascotSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/mascot", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const merged: MascotSettings = {
          mascotUrl: data.mascotUrl || DEFAULT_MASCOT_SETTINGS.mascotUrl,
          mascotAlt: data.mascotAlt || DEFAULT_MASCOT_SETTINGS.mascotAlt,
          size: typeof data.size === "number" ? data.size : DEFAULT_MASCOT_SETTINGS.size,
          showTooltip: data.showTooltip !== undefined ? Boolean(data.showTooltip) : true,
          tooltipText: data.tooltipText || DEFAULT_MASCOT_SETTINGS.tooltipText,
          updatedAt: data.updatedAt,
        };
        setMascotSettings(merged);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn("Failed to refresh mascot settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMascotSettings();
  }, [refreshMascotSettings]);

  const updateLocalSettings = useCallback((partial: Partial<MascotSettings>) => {
    setMascotSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Resolve R2 or local or base64 src
  const rawUrl = mascotSettings.mascotUrl || DEFAULT_MASCOT_SETTINGS.mascotUrl;
  const resolvedMascotSrc = rawUrl.startsWith("r2:")
    ? `/api/media?key=${encodeURIComponent(rawUrl.slice(3))}`
    : rawUrl;

  return (
    <MascotContext.Provider
      value={{
        mascotSettings,
        isLoading,
        resolvedMascotSrc,
        updateLocalSettings,
        refreshMascotSettings,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useSiteMascot() {
  return useContext(MascotContext);
}
