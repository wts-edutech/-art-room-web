"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface LogoSettings {
  logoUrl: string;
  logoAlt: string;
  brandNamePrefix: string;
  brandNameSuffix: string;
  schoolName: string;
  showText: boolean;
  logoShape: "square" | "circle" | "rounded";
  logoSize: "compact" | "normal" | "large" | "custom";
  customSize?: number;
  logoScale?: number;
  updatedAt?: string;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  logoUrl: "/artroom-logo.png",
  logoAlt: "โลโก้ Art Room โรงเรียนวชิรธรรมสาธิต",
  brandNamePrefix: "ART",
  brandNameSuffix: "ROOM",
  schoolName: "WACHIRATHAMMASATIT SCHOOL",
  showText: true,
  logoShape: "circle",
  logoSize: "large",
  customSize: 90,
  logoScale: 100,
};

interface LogoContextType {
  logoSettings: LogoSettings;
  isLoading: boolean;
  updateLocalSettings: (settings: Partial<LogoSettings>) => void;
  refreshLogoSettings: () => Promise<void>;
}

const LogoContext = createContext<LogoContextType>({
  logoSettings: DEFAULT_LOGO_SETTINGS,
  isLoading: true,
  updateLocalSettings: () => {},
  refreshLogoSettings: async () => {},
});

const STORAGE_KEY = "artroom_site_logo_settings";

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.logoUrl === "/school-logo.png" || parsed.logoUrl?.startsWith("data:image")) {
            parsed.logoUrl = "/artroom-logo.png";
          }
          return { ...DEFAULT_LOGO_SETTINGS, ...parsed };
        }
      } catch {
        // Fallback to default
      }
    }
    return DEFAULT_LOGO_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/logo");
      if (res.ok) {
        const data: any = await res.json();
        const rawLogoUrl = data.logoUrl;
        const normalizedLogoUrl = (!rawLogoUrl || rawLogoUrl === "/school-logo.png" || rawLogoUrl.startsWith("data:image"))
          ? "/artroom-logo.png"
          : rawLogoUrl;

        const merged: LogoSettings = {
          logoUrl: normalizedLogoUrl,
          logoAlt: data.logoAlt || DEFAULT_LOGO_SETTINGS.logoAlt,
          brandNamePrefix: data.brandNamePrefix || DEFAULT_LOGO_SETTINGS.brandNamePrefix,
          brandNameSuffix: data.brandNameSuffix || DEFAULT_LOGO_SETTINGS.brandNameSuffix,
          schoolName: data.schoolName || DEFAULT_LOGO_SETTINGS.schoolName,
          showText: data.showText !== undefined ? Boolean(data.showText) : true,
          logoShape: data.logoShape || "circle",
          logoSize: data.logoSize || "large",
          customSize: typeof data.customSize === "number" ? data.customSize : 90,
          logoScale: typeof data.logoScale === "number" ? data.logoScale : 100,
          updatedAt: data.updatedAt,
        };
        setLogoSettings(merged);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch (err) {
      console.warn("Failed to fetch logo settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocalSettings = useCallback((updated: Partial<LogoSettings>) => {
    setLogoSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for cross-tab or in-page update events
    const handleUpdateEvent = (e: CustomEvent<LogoSettings>) => {
      if (e.detail) {
        setLogoSettings(e.detail);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(e.detail));
        } catch {}
      } else {
        fetchSettings();
      }
    };

    window.addEventListener("artroom_logo_updated" as any, handleUpdateEvent);
    return () => {
      window.removeEventListener("artroom_logo_updated" as any, handleUpdateEvent);
    };
  }, [fetchSettings]);

  return (
    <LogoContext.Provider
      value={{
        logoSettings,
        isLoading,
        updateLocalSettings,
        refreshLogoSettings: fetchSettings,
      }}
    >
      {children}
    </LogoContext.Provider>
  );
}

export function useSiteLogo() {
  const context = useContext(LogoContext);
  return context;
}
