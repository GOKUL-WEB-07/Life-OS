import type { Subtask } from "../types/models";
export const MAX_SUBTASKS = 20;
export function validateSubtasks(value: unknown) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > MAX_SUBTASKS)
    throw new Error("Use up to 20 subtasks per task.");
  const ids = new Set<string>();
  for (const item of value) {
    if (
      !item ||
      typeof item.id !== "string" ||
      !item.id ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      item.title.length > 300 ||
      typeof item.completed !== "boolean" ||
      ids.has(item.id)
    )
      throw new Error(
        "Each subtask needs a unique ID and a title under 300 characters.",
      );
    ids.add(item.id);
  }
}
export function moveSubtask(items: Subtask[], id: string, offset: number) {
  const index = items.findIndex((item) => item.id === id);
  const target = index + offset;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
