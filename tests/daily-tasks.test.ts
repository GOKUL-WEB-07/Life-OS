import { expect, it } from "vitest";
import { seed } from "./fixtures/workspace";
import { dailyTasks, millisecondsToMidnight } from "../src/utils/dailyTasks";
it("starts a new list at the day boundary without deleting yesterday", () => {
  const task = seed().tasks[0];
  const tasks = [
    { ...task, id: "yesterday", scheduledDate: "2026-10-12", dueDate: "" },
    { ...task, id: "today", scheduledDate: "2026-10-13", dueDate: "" },
  ];
  expect(dailyTasks(tasks, "2026-10-12").map((t) => t.id)).toEqual([
    "yesterday",
  ]);
  expect(dailyTasks(tasks, "2026-10-13").map((t) => t.id)).toEqual(["today"]);
  expect(dailyTasks(tasks, "2026-10-14")).toEqual([]);
  expect(tasks).toHaveLength(2);
});
it("includes completed entries for their day and scheduled date takes precedence", () => {
  const task = seed().tasks[0];
  const tasks = [
    { ...task, id: "done", scheduledDate: "2026-10-13", completed: true },
    { ...task, id: "open", scheduledDate: "2026-10-13", completed: false },
    {
      ...task,
      id: "future",
      scheduledDate: "2026-10-14",
      dueDate: "2026-10-13",
    },
    { ...task, id: "due", scheduledDate: "", dueDate: "2026-10-13" },
  ];
  expect(dailyTasks(tasks, "2026-10-13").map((t) => t.id)).toEqual([
    "open",
    "due",
    "done",
  ]);
});
it("targets next local midnight including month and year boundaries", () => {
  expect(millisecondsToMidnight(new Date(2026, 9, 13, 23, 59, 59, 500))).toBe(
    500,
  );
  expect(millisecondsToMidnight(new Date(2026, 11, 31, 23, 59, 59))).toBe(1000);
  expect(millisecondsToMidnight(new Date(2026, 9, 13, 0, 0, 0))).toBe(86400000);
});
