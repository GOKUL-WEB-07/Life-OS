import { useSaveAction } from "../hooks/useSaveAction";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { Task } from "../types/models";
import { useData } from "../app/providers/DataProvider";
import { useEditor } from "./QuickAdd";
import { EmptyState } from "./feedback/Feedback";
import { niceDate } from "../utils/dates";
import { isOverdue } from "../utils/work";
export function TaskRow({ task }: { task: Task }) {
  const { data, toggleTask, history } = useData();
  const edit = useEditor();
  const { busy, pending, error, run } = useSaveAction();
  const project = data.projects.find((p) => p.id === task.projectId);
  const time = task.scheduledStart
    ? new Date("2000-01-01T" + task.scheduledStart).toLocaleTimeString(
        undefined,
        { hour: "numeric", minute: "2-digit" },
      )
    : "";
  return (
    <div className={"task-row " + (task.completed ? "completed" : "")}>
      <div className="task-main">
        <button
          className="row-title"
          onClick={() => edit({ type: "tasks", id: task.id })}
        >
          {task.title}
        </button>
        <div className="task-meta">
          {time && <span>{time}</span>}
          {task.dueDate && (
            <span className={isOverdue(task) ? "danger-text" : ""}>
              {isOverdue(task) ? "Overdue · " : "Due "}
              {niceDate(task.dueDate)}
            </span>
          )}
          {project && (
            <Link to={"/projects/" + project.id}>{project.name}</Link>
          )}
          {task.priority === "high" && (
            <span className="task-priority">High priority</span>
          )}
          {!!task.subtasks?.length && (
            <span>
              {task.subtasks.filter((s) => s.completed).length}/
              {task.subtasks.length} steps
            </span>
          )}
        </div>
        {pending && <p role="status">Saving completion...</p>}
        {error && (
          <p role="alert" className="danger-text">
            {error}
          </p>
        )}
      </div>
      <label className="checkbox-target">
        <input
          className="task-checkbox"
          type="checkbox"
          aria-label={(task.completed ? "Reopen " : "Complete ") + task.title}
          checked={task.completed}
          disabled={busy || history.busy}
          onChange={() => void run(() => toggleTask(task.id))}
        />
        <span className="task-check-visual" aria-hidden="true">
          {task.completed && <Check size={23} strokeWidth={3} />}
        </span>
      </label>
    </div>
  );
}
export function TaskList({
  tasks,
  empty = "Nothing needs attention.",
}: {
  tasks: Task[];
  empty?: string;
}) {
  return tasks.length ? (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  ) : (
    <EmptyState title={empty} detail="Add a task when you’re ready." />
  );
}
