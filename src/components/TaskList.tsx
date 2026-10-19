import { useSaveAction } from "../hooks/useSaveAction";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import type { Task } from "../types/models";
import { useData } from "../app/providers/DataProvider";
import { useEditor } from "./QuickAdd";
import { useToast, EmptyState } from "./feedback/Feedback";
import { niceDate } from "../utils/dates";
import { isOverdue } from "../utils/work";
import { errorMessage } from "../utils/errors";
export function TaskRow({ task }: { task: Task }) {
  const { data, toggleTask } = useData();
  const edit = useEditor();
  const toast = useToast();
  const { busy, pending, error, run } = useSaveAction();
  const project = data.projects.find((p) => p.id === task.projectId);
  return (
    <div className={"task-row " + (task.completed ? "completed" : "")}>
      <label className="checkbox-target">
        <input
          className="task-checkbox"
          type="checkbox"
          aria-label={(task.completed ? "Reopen " : "Complete ") + task.title}
          checked={task.completed}
          disabled={busy}
          onChange={() => {
            void run(() => toggleTask(task.id));
          }}
        />
      </label>
      <div className="task-main">
        <button
          className="row-title"
          onClick={() => edit({ type: "tasks", id: task.id })}
        >
          {task.title}
        </button>
        {pending && (
          <p role="status" className="row-save-feedback">
            Completion is awaiting confirmation.
          </p>
        )}
        {error && (
          <p role="alert" className="row-save-feedback danger-text">
            {error}
          </p>
        )}
        <div className="task-meta">
          {!!task.subtasks?.length && (
            <span>
              {task.subtasks.filter((s) => s.completed).length}/
              {task.subtasks.length} steps
            </span>
          )}
          {task.dueDate && (
            <span
              className={
                "mobile-task-date " + (isOverdue(task) ? "danger-text" : "")
              }
            >
              {isOverdue(task) ? "Overdue · " : "Due "}
              {niceDate(task.dueDate)}
            </span>
          )}
          {project ? (
            <Link to={"/projects/" + project.id}>{project.name}</Link>
          ) : task.projectId ? (
            <span>Project unavailable</span>
          ) : null}
          {task.status !== "todo" && (
            <span>{task.status.replace("-", " ")}</span>
          )}
          {task.scheduledStart && <span>{task.scheduledStart}</span>}
        </div>
      </div>
      {task.dueDate && (
        <span className={"task-date " + (isOverdue(task) ? "danger-text" : "")}>
          {isOverdue(task) ? "Overdue · " : ""}
          {niceDate(task.dueDate)}
        </span>
      )}
      {task.priority === "high" && (
        <span className={"priority " + task.priority}>
          <Flag size={13} />
          High
        </span>
      )}
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
