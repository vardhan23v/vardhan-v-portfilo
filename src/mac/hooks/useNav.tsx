import { createContext, useContext, useState, type ReactNode } from "react";
import type { Project } from "../data/projects";

export type PageId =
  | "overview"
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "achievements"
  | "contact";

interface NavCtx {
  page: PageId;
  navigate: (p: PageId) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  /** cross-page project quick-view (palette / overview can open it) */
  openProject: Project | null;
  setOpenProject: (p: Project | null) => void;
}

const Ctx = createContext<NavCtx>({
  page: "overview",
  navigate: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  openProject: null,
  setOpenProject: () => {},
});

export const NAV_ITEMS: { id: PageId; label: string; shortcut: string; section: "main" | "connect" }[] = [
  { id: "overview", label: "Overview", shortcut: "1", section: "main" },
  { id: "about", label: "About", shortcut: "2", section: "main" },
  { id: "projects", label: "Projects", shortcut: "3", section: "main" },
  { id: "experience", label: "Experience", shortcut: "4", section: "main" },
  { id: "skills", label: "Skills", shortcut: "5", section: "main" },
  { id: "achievements", label: "Achievements", shortcut: "6", section: "main" },
  { id: "contact", label: "Contact", shortcut: "7", section: "main" },
];

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  const navigate = (p: PageId) => {
    setPage(p);
    setMobileOpen(false);
  };

  return (
    <Ctx.Provider value={{ page, navigate, mobileOpen, setMobileOpen, openProject, setOpenProject }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNav = () => useContext(Ctx);
