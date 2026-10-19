import { seed } from "./fixtures/workspace";
import { beforeEach, describe, it, expect } from "vitest";
import {
  startDemo,
  logout,
  currentUser,
  renameProfile,
} from "../src/services/authService";
import { demoData, saveDemo } from "../src/services/demoService";
import { save, remove, observe } from "../src/services/repository";
import { defaults } from "../src/utils/forms";
import { initializeUser } from "../src/services/userService";
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  startDemo();
  localStorage.setItem("project-os-empty-migration", "1");
  saveDemo(seed());
});
describe("demo service workflows", () => {
  it("persists the local demo display name", async () => {
    await renameProfile("Alex QA");
    expect(localStorage.getItem("project-os-demo-name")).toBe("Alex QA");
    expect(currentUser().displayName).toBe("Alex QA");
    await renameProfile("Alex Morgan");
  });
  it("creates, edits and archives areas", async () => {
    const id = await save("areas", { ...defaults("areas"), name: "Health" });
    await save(
      "areas",
      { ...defaults("areas"), name: "Wellbeing", archived: true, order: 9 },
      id,
    );
    expect(demoData().areas.find((a) => a.id === id)).toMatchObject({
      name: "Wellbeing",
      archived: true,
      order: 9,
    });
  });
  it("creates, edits and archives a project", async () => {
    const id = await save("projects", {
      ...defaults("projects"),
      name: "New project",
      areaId: "area-0",
    });
    await save(
      "projects",
      {
        ...defaults("projects"),
        name: "Renamed",
        areaId: "area-0",
        status: "archived",
      },
      id,
    );
    expect(demoData().projects.find((p) => p.id === id)?.status).toBe(
      "archived",
    );
    await expect(remove("projects", id)).rejects.toThrow("Archive");
  });
  it("creates, schedules, links, completes, reopens and deletes a task", async () => {
    const input = {
      ...defaults("tasks"),
      title: "Test task",
      projectId: "project-0",
      areaId: "area-0",
      dueDate: "2026-10-08",
      scheduledDate: "2026-10-07",
      scheduledStart: "09:00",
      scheduledEnd: "10:00",
    };
    const id = await save("tasks", input);
    expect(demoData().tasks.find((t) => t.id === id)).toMatchObject(input);
    await save("tasks", { ...input, status: "done" }, id);
    expect(
      demoData().tasks.find((t) => t.id === id)?.completedAt,
    ).not.toBeNull();
    await save("tasks", { ...input, status: "todo" }, id);
    expect(demoData().tasks.find((t) => t.id === id)).toMatchObject({
      completed: false,
      completedAt: null,
      status: "todo",
    });
    await remove("tasks", id);
    expect(demoData().tasks.some((t) => t.id === id)).toBe(false);
  });
  it.each(["tasks", "projects", "reminders"] as const)(
    "atomically converts inbox to %s",
    async (type) => {
      const source = await save("inboxItems", {
        text: "An idea",
        type: "unprocessed",
      });
      const input =
        type === "projects"
          ? { ...defaults(type), name: "An idea", areaId: "area-0" }
          : { ...defaults(type), title: "An idea" };
      await save(type, input, undefined, source);
      expect(demoData().inboxItems.some((i) => i.id === source)).toBe(false);
      const before = demoData()[type].length;
      await expect(save(type, input, undefined, source)).rejects.toThrow(
        "no longer exists",
      );
      expect(demoData()[type]).toHaveLength(before);
    },
  );
  it("creates, completes and deletes reminders; creates and edits events", async () => {
    const id = await save("reminders", {
      ...defaults("reminders"),
      title: "Call",
    });
    await save(
      "reminders",
      { ...defaults("reminders"), title: "Call", completed: true },
      id,
    );
    expect(demoData().reminders.find((r) => r.id === id)?.completed).toBe(true);
    await remove("reminders", id);
    const event = await save("calendarEvents", {
      ...defaults("calendarEvents"),
      title: "Meeting",
      startTime: "11:00",
      endTime: "12:00",
    });
    await save(
      "calendarEvents",
      { ...defaults("calendarEvents"), title: "Updated", allDay: true },
      event,
    );
    expect(demoData().calendarEvents.find((e) => e.id === event)?.allDay).toBe(
      true,
    );
  });
  it("keeps the original completion timestamp when editing a completed task", async () => {
    const input = {
      ...defaults("tasks"),
      title: "Complete",
      status: "done" as const,
    };
    const id = await save("tasks", input);
    const completed = demoData()
      .tasks.find((t) => t.id === id)
      ?.completedAt?.toMillis();
    await save("tasks", { ...input, title: "Renamed" }, id);
    expect(
      demoData()
        .tasks.find((t) => t.id === id)
        ?.completedAt?.toMillis(),
    ).toBe(completed);
  });
  it("emits updates and prevents changing ownership through input", async () => {
    let length = 0;
    const stop = observe(
      "tasks",
      (items) => (length = items.length),
      () => {},
    );
    await save("tasks", {
      ...defaults("tasks"),
      title: "Owned",
      ...{ userId: "attacker" },
    });
    expect(demoData().tasks.at(-1)?.userId).toBe("local-demo");
    expect(length).toBe(demoData().tasks.length);
    stop();
  });
  it("does not duplicate demo defaults and blocks mutations after logout", async () => {
    await initializeUser();
    await initializeUser();
    expect(demoData().areas).toHaveLength(4);
    await logout();
    expect(() => currentUser()).toThrow("Sign in");
    await expect(
      save("tasks", { ...defaults("tasks"), title: "Blocked" }),
    ).rejects.toThrow("Sign in");
  });
});

it("creates and edits projects without an Area and links tasks to them", async () => {
  const input = { ...defaults("projects"), name: "Independent project" };
  const id = await save("projects", input);
  await save("projects", { ...input, name: "Updated project" }, id);
  const task = await save("tasks", {
    ...defaults("tasks"),
    title: "Linked task",
    projectId: id,
  });
  expect(demoData().projects.find((p) => p.id === id)?.areaId).toBe("");
  expect(demoData().tasks.find((t) => t.id === task)).toMatchObject({
    projectId: id,
    areaId: "",
  });
});
