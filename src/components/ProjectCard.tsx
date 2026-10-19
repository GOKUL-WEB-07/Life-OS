import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { Project } from "../types/models";
import { useData } from "../app/providers/DataProvider";
import { projectProgress } from "../utils/work";
import { niceDate, daysBetween } from "../utils/dates";
import { Badge } from "./ui/Fields";
export function ProjectCard({ project }: { project: Project }) {
  const { data } = useData();
  const progress = projectProgress(project, data.tasks);
  return (
    <Link
      to={"/projects/" + project.id}
      className="project-card"
      style={{ "--project-color": "#6c5ce7" } as CSSProperties}
    >
      <div className="project-card-top">
        <span className="area-label">Project</span>
        <ArrowUpRight size={18} />
      </div>
      <h3>{project.name}</h3>
      <Badge>{project.status}</Badge>
      <div className="progress-label">
        <span>
          {progress.done} / {progress.total} tasks
        </span>
        <strong>{progress.percent}%</strong>
      </div>
      <progress
        max={100}
        value={progress.percent}
        aria-label={project.name + " progress"}
      />
      <div className="card-deadline">
        {project.deadline ? (
          <>
            <span>Due {niceDate(project.deadline)}</span>
            <span
              className={daysBetween(project.deadline) < 0 ? "danger-text" : ""}
            >
              {daysBetween(project.deadline) < 0
                ? "Overdue"
                : daysBetween(project.deadline) === 0
                  ? "Today"
                  : daysBetween(project.deadline) +
                    (daysBetween(project.deadline) === 1
                      ? " day left"
                      : " days left")}
            </span>
          </>
        ) : (
          <span>No deadline</span>
        )}
      </div>
    </Link>
  );
}
