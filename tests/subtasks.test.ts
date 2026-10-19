import { beforeEach, it, expect } from "vitest";
import { validateSubtasks, moveSubtask } from "../src/utils/subtasks";
import { startDemo } from "../src/services/authService";
import { demoData } from "../src/services/demoService";
import { save } from "../src/services/repository";
import { defaults } from "../src/utils/forms";
beforeEach(() => {
  localStorage.clear();
  startDemo();
});
it("supports old tasks and rejects malformed or excessive steps", () => {
  expect(() => validateSubtasks(undefined)).not.toThrow();
  expect(() =>
    validateSubtasks([{ id: "a", title: " ", completed: false }]),
  ).toThrow();
  expect(() =>
    validateSubtasks([
      { id: "a", title: "One", completed: false },
      { id: "a", title: "Two", completed: true },
    ]),
  ).toThrow();
  expect(() =>
    validateSubtasks(
      Array.from({ length: 21 }, (_, i) => ({
        id: String(i),
        title: "Step",
        completed: false,
      })),
    ),
  ).toThrow();
});
it("reorders without mutating the saved order and handles edges", () => {
  const items = [
    { id: "a", title: "One", completed: false },
    { id: "b", title: "Two", completed: true },
  ];
  expect(moveSubtask(items, "b", -1).map((i) => i.id)).toEqual(["b", "a"]);
  expect(items[0].id).toBe("a");
  expect(moveSubtask(items, "a", -1)).toBe(items);
});
it("persists editing, ordering, and completion without completing the task", async () => {
  const input = {
    ...defaults("tasks"),
    title: "Parent",
    subtasks: [
      { id: "a", title: " One ", completed: false },
      { id: "b", title: "Two", completed: false },
    ],
  };
  const id = await save("tasks", input);
  const first = demoData().tasks.find((t) => t.id === id)!;
  expect(first.subtasks?.[0].title).toBe("One");
  await save(
    "tasks",
    {
      ...first,
      subtasks: moveSubtask(first.subtasks!, "b", -1).map((s) => ({
        ...s,
        completed: true,
      })),
    },
    id,
  );
  const updated = demoData().tasks.find((t) => t.id === id)!;
  expect(updated.subtasks?.map((s) => s.id)).toEqual(["b", "a"]);
  expect(updated.completed).toBe(false);
  await save("tasks", { ...updated, status: "done" }, id);
  await save(
    "tasks",
    { ...demoData().tasks.find((t) => t.id === id)!, status: "todo" },
    id,
  );
  expect(
    demoData()
      .tasks.find((t) => t.id === id)
      ?.subtasks?.every((s) => s.completed),
  ).toBe(true);
});
