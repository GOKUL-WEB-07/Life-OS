import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, ChevronLeft, Plus } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { TaskList } from "../../components/TaskList";
import { EmptyState } from "../../components/feedback/Feedback";
import { useSaveAction } from "../../hooks/useSaveAction";
import { defaults } from "../../utils/forms";
export function ProjectDetail() {
  const { projectId } = useParams();
  const { data, saveItem } = useData();
  const open = useEditor();
  const project = data.projects.find((p) => p.id === projectId);
  const [text, setText] = useState("");
  const [description, setDescription] = useState<string | null>(null);
  const { run, busy, error } = useSaveAction();
  useEffect(() => {
    setDescription(null);
    setText("");
  }, [projectId]);
  if (!project)
    return (
      <EmptyState
        title="Project not found"
        action={<Link to="/projects">Back to projects</Link>}
      />
    );
  const tasks = data.tasks.filter((t) => t.projectId === project.id);
  async function add(e: FormEvent) {
    e.preventDefault();
    if (!project || !text.trim()) return;
    const title = text.trim();
    if (
      await run(() =>
        saveItem("tasks", {
          ...defaults("tasks"),
          title,
          projectId: project.id,
          areaId: project.areaId,
        }),
      )
    )
      setText("");
  }
  return (
    <div className="simple-project">
      <Link className="back-link" to="/projects">
        <ChevronLeft size={16} />
        Projects
      </Link>
      <div className="simple-project-heading">
        <h1>{project.name}</h1>
        <button
          className="icon-button"
          aria-label="Edit project details"
          onClick={() => open({ type: "projects", id: project.id })}
        >
          <Pencil size={17} />
        </button>
      </div>
      <textarea
        key={project.id}
        className="project-writing"
        aria-label="About project"
        placeholder="Write about this project..."
        value={description ?? project.description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
      />
      {description !== null && description !== project.description && (
        <button
          className="button secondary compact"
          disabled={busy}
          onClick={() =>
            void run(() =>
              saveItem("projects", { ...project, description }, project.id),
            )
          }
        >
          Save description
        </button>
      )}
      <section className="project-todos">
        <h2>To-do</h2>
        <form className="project-inline-add" onSubmit={add}>
          <Plus size={18} />
          <input
            aria-label="New project to-do"
            placeholder="Add a to-do..."
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button className="button compact" disabled={busy || !text.trim()}>
            Add
          </button>
        </form>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {tasks.length ? (
          <TaskList tasks={tasks} />
        ) : (
          <p className="project-empty">Your next steps start here.</p>
        )}
      </section>
    </div>
  );
}
