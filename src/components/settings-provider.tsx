"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type GlobalSettings = {
  brand_name: string;
  tagline: string;
  hero_title: string;
  hero_description: string;
  logo_url: string;
  two_factor_auth: boolean;
  ip_restriction: boolean;
  session_heartbeat: boolean;
};

const defaultSettings: GlobalSettings = {
  brand_name: "Ajinora",
  tagline: "Next-Gen Learning",
  hero_title: "Empowering the minds of tomorrow",
  hero_description: "A limitless educational ecosystem combining intelligent tools, interactive curriculums, and seamless performance tracking",
  logo_url: "",
  two_factor_auth: false,
  ip_restriction: false,
  session_heartbeat: true
};

type SettingsContextType = {
  settings: GlobalSettings;
  updateSettings: (newSettings: GlobalSettings) => void;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isLoading: true
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/public/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load global settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: setSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}
