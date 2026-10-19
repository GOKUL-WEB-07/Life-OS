import type { Task } from "../types/models";
export function dailyTasks(tasks: Task[], date: string) {
  return tasks
    .filter((task) => (task.scheduledDate || task.dueDate) === date)
    .sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) ||
        (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
    );
}
export function millisecondsToMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}
