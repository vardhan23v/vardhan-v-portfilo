import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  action: () => void;
}

interface PaletteCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  items: PaletteItem[];
  register: (items: PaletteItem[]) => void;
}

const Ctx = createContext<PaletteCtx>({
  open: false,
  setOpen: () => {},
  items: [],
  register: () => {},
});

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PaletteItem[]>([]);

  const register = useCallback((newItems: PaletteItem[]) => {
    setItems((prev) => {
      const ids = new Set(newItems.map((i) => i.id));
      const filtered = prev.filter((i) => !ids.has(i.id));
      return [...filtered, ...newItems];
    });
  }, []);

  return <Ctx.Provider value={{ open, setOpen, items, register }}>{children}</Ctx.Provider>;
}

export const usePalette = () => useContext(Ctx);
export type { PaletteItem };
