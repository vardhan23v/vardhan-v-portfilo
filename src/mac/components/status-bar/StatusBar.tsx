import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";
import { skillCategories } from "../../data/skills";

export function StatusBar() {
  return (
    <div className="mac-statusbar">
      <div className="mac-statusbar__left">
        <span>
          <span className="mac-statusbar__dot" />
          Available
        </span>
      </div>
      <div className="mac-statusbar__right">
        <span>{featuredProjects.length} Projects</span>
        <span>{skillCategories.length} Skill Groups</span>
        <span>{site.location}</span>
      </div>
    </div>
  );
}
