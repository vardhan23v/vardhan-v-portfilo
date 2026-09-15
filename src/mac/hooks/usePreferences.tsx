import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Persisted OS-level preferences (Control Center + Settings). */
export interface Preferences {
  accent: string;
  dnd: boolean;
  reduceMotion: boolean;
  dockAutoHide: boolean;
  brightness: number;
  volume: number;
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  devMode: boolean;
  /** "mesh" (accent-driven), "grad:<name>", or an image URL */
  wallpaper: string;
}

const DEFAULTS: Preferences = {
  accent: "blue",
  dnd: false,
  reduceMotion: false,
  dockAutoHide: false,
  brightness: 1,
  volume: 0.6,
  wifi: true,
  bluetooth: true,
  airdrop: true,
  devMode: false,
  wallpaper: "mesh",
};

const STORAGE = "mac-preferences";

type ToggleKey = "dnd" | "reduceMotion" | "dockAutoHide" | "wifi" | "bluetooth" | "airdrop" | "devMode";

interface PrefCtx {
  prefs: Preferences;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggle: (key: ToggleKey) => void;
}

const Ctx = createContext<PrefCtx>({ prefs: DEFAULTS, set: () => {}, toggle: () => {} });

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return DEFAULTS;
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs]);

  const set = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  const toggle = useCallback((key: ToggleKey) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  return <Ctx.Provider value={{ prefs, set, toggle }}>{children}</Ctx.Provider>;
}

export const usePreferences = () => useContext(Ctx);