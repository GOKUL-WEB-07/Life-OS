import { dueItems } from "./life";
import type { AppData, Task, Project } from "../types/models";
import { localDate } from "./dates";
export const isToday = (task: Task, today = localDate()) =>
  task.scheduledDate === today || task.dueDate === today;
export const isOverdue = (task: Task, today = localDate()) =>
  !task.completed && !!task.dueDate && task.dueDate < today;
export function projectProgress(project: Project, tasks: Task[]) {
  const linked = tasks.filter((t) => t.projectId === project.id);
  const done = linked.filter((t) => t.completed).length;
  return {
    total: linked.length,
    done,
    percent: linked.length ? Math.round((done / linked.length) * 100) : 0,
  };
}
export function homeTasks(tasks: Task[], today = localDate()) {
  const rank = (t: Task) =>
    isOverdue(t, today) && t.priority === "high"
      ? 0
      : isToday(t, today) && t.priority === "high"
        ? 1
        : isToday(t, today)
          ? 2
          : 3;
  return tasks
    .filter(
      (t) =>
        !t.completed &&
        (isToday(t, today) || isOverdue(t, today) || !!t.dueDate),
    )
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    )
    .slice(0, 5);
}
export type AgendaItem = {
  id: string;
  type:
    | "tasks"
    | "calendarEvents"
    | "reminders"
    | "projects"
    | "subscriptions"
    | "documents"
    | "bills";
  title: string;
  time: string;
  end: string;
  completed: boolean;
  projectId?: string;
};
export function agenda(data: AppData, date: string): AgendaItem[] {
  return [
    ...dueItems(data)
      .filter(
        (i) =>
          ["subscriptions", "documents", "bills"].includes(i.type) &&
          i.date === date,
      )
      .map((i) => ({
        id: i.id,
        type: i.type as "subscriptions" | "documents" | "bills",
        title: i.title,
        time: "",
        end: "",
        completed: false,
      })),
    ...data.projects
      .filter(
        (p) =>
          p.status !== "archived" &&
          (p.startDate === date || p.deadline === date),
      )
      .map((p) => ({
        id: p.id,
        type: "projects" as const,
        title:
          p.name +
          (p.startDate === date && p.deadline === date
            ? " — Start & deadline"
            : p.startDate === date
              ? " — Starts"
              : " — Deadline"),
        time: "",
        end: "",
        completed: p.status === "completed",
      })),
    ...data.tasks
      .filter((t) => isToday(t, date))
      .map((t) => ({
        id: t.id,
        type: "tasks" as const,
        title: t.title,
        time: t.scheduledDate === date ? t.scheduledStart : "",
        end: t.scheduledDate === date ? t.scheduledEnd : "",
        completed: t.completed,
        projectId: t.projectId,
      })),
    ...data.calendarEvents
      .filter((e) => e.date === date)
      .map((e) => ({
        id: e.id,
        type: "calendarEvents" as const,
        title: e.title,
        time: e.allDay ? "" : e.startTime,
        end: e.endTime,
        completed: false,
      })),
    ...data.reminders
      .filter((r) => r.date === date)
      .map((r) => ({
        id: r.id,
        type: "reminders" as const,
        title: r.title,
        time: r.time,
        end: "",
        completed: r.completed,
      })),
  ].sort(
    (a, b) =>
      (a.time || "99:99").localeCompare(b.time || "99:99") ||
      a.title.localeCompare(b.title),
  );
}
export function taskCompletion(done: boolean) {
  return {
    completed: done,
    status: done ? ("done" as const) : ("todo" as const),
  };
}
