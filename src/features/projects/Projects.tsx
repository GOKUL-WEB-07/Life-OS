import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { ProjectCard } from "../../components/ProjectCard";
import { EmptyState } from "../../components/feedback/Feedback";
export function Projects() {
  const { data } = useData();
  const open = useEditor();
  const [filter, setFilter] = useState("all");
  const projects = data.projects.filter((p) =>
    filter === "all"
      ? p.status !== "archived"
      : filter === "active"
        ? ["planning", "active"].includes(p.status)
        : p.status === filter,
  );
  return (
    <>
      <PageHeader
        title="Projects"
        description="The bigger picture, one project at a time."
        action={
          <button className="button" onClick={() => open({ type: "projects" })}>
            <Plus size={18} />
            New project
          </button>
        }
      />
      <div className="filter-bar">
        <div className="tabs" aria-label="Project filters">
          {["all", "active", "completed", "paused", "archived"].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={filter === f ? "selected" : ""}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {projects.length ? (
        <div className="project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project name</th>
                <th>Created time</th>
                <th>End date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={"/projects/" + p.id}>{p.name}</Link>
                  </td>
                  <td>
                    {p.createdAt?.toDate().toLocaleDateString("en-IN") || "-"}
                  </td>
                  <td>{p.deadline || "-"}</td>
                  <td>
                    <span className={"record-tag " + p.priority}>
                      {p.priority}
                    </span>
                  </td>
                  <td>
                    <span className="record-tag">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No projects yet."
          detail="Create a project to give related work a home."
        />
      )}
    </>
  );
}
