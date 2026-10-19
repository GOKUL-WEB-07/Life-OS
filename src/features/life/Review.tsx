import { Link } from "react-router-dom";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { TaskList } from "../../components/TaskList";
import { ProjectCard } from "../../components/ProjectCard";
export function Review({ archive = false }: { archive?: boolean }) {
  const { data } = useData();
  const open = useEditor();
  return (
    <>
      <PageHeader
        title={archive ? "Archive" : "Weekly review"}
        description={
          archive
            ? "Completed and archived work, kept within reach."
            : "Close open loops and choose what deserves your attention."
        }
      />
      <div className="panel section-pad">
        <h2>{archive ? "Archived projects" : "Projects to revisit"}</h2>
        <div className="project-grid">
          {data.projects
            .filter((p) =>
              archive
                ? ["archived", "completed"].includes(p.status)
                : ["paused", "planning"].includes(p.status),
            )
            .map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
        </div>
        <h2>{archive ? "Completed tasks" : "Blocked tasks"}</h2>
        <TaskList
          tasks={data.tasks.filter((t) =>
            archive ? t.completed : t.status === "blocked",
          )}
        />
        <h2>{archive ? "Archived notes and ideas" : "Unprocessed inbox"}</h2>
        {archive ? (
          [
            ...data.notes.map((i) => ({ ...i, type: "notes" as const })),
            ...data.ideas.map((i) => ({ ...i, type: "ideas" as const })),
          ]
            .filter((i) => i.archived)
            .map((i) => (
              <button
                className="search-result"
                key={i.id}
                onClick={() => open({ type: i.type, id: i.id })}
              >
                {i.title}
              </button>
            ))
        ) : (
          <Link to="/inbox">
            Organize {data.inboxItems.length} captured items
          </Link>
        )}
      </div>
    </>
  );
}
