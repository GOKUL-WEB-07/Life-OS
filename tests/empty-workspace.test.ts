import { beforeEach, expect, it } from "vitest";
import { demoData, saveDemo } from "../src/services/demoService";
import { seed } from "./fixtures/workspace";
beforeEach(() => localStorage.clear());
it("starts with no seeded records and remains empty on reload", () => {
  expect(Object.values(demoData()).every((items) => items.length === 0)).toBe(
    true,
  );
  expect(demoData().areas).toEqual([]);
});
it("removes bundled examples, preserves created work and clears removed references", () => {
  const data = seed();
  data.tasks.push({ ...data.tasks[0], id: "created-task", title: "My work" });
  saveDemo(data);
  const migrated = demoData();
  expect(migrated.projects).toEqual([]);
  expect(migrated.tasks).toHaveLength(1);
  expect(migrated.tasks[0]).toMatchObject({
    id: "created-task",
    title: "My work",
    projectId: "",
    areaId: "",
  });
  expect(demoData().tasks).toHaveLength(1);
});
