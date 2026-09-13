import { useNav } from "../../hooks/useNav";
import { useGithub } from "../../hooks/useGithub";
import { useIstTime } from "../../hooks/useIstTime";
import { featuredProjects } from "../../data/projects";

const PAGE_LABEL: Record<string, string> = {
  overview: "Overview",
  about: "About",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  achievements: "Achievements",
  contact: "Contact",
};

export function StatusBar() {
  const { page } = useNav();
  const { followers, loading } = useGithub();
  const ist = useIstTime();

  return (
    <div className="mac-statusbar">
      <div className="mac-statusbar__left">
        <span>
          <span className="mac-statusbar__dot" />
          Available
        </span>
        <span key={page} className="mac-statusbar__page mac-toolbar__title--fade">{PAGE_LABEL[page]}</span>
      </div>
      <div className="mac-statusbar__right">
        <span className="mac-statusbar__hide-m">{featuredProjects.length} Projects</span>
        <span title="GitHub followers">
          {loading ? <span className="mac-skeleton">--</span> : followers} ★
        </span>
        <span className="mac-statusbar__hide-m">{ist}</span>
      </div>
    </div>
  );
}
