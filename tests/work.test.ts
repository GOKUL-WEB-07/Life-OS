import { describe, it, expect } from "vitest";
import { defaults, validate } from "../src/utils/forms";
import { localDate, addDays, daysBetween } from "../src/utils/dates";
import {
  agenda,
  homeTasks,
  isToday,
  isOverdue,
  projectProgress,
  taskCompletion,
} from "../src/utils/work";
import { search } from "../src/services/searchService";
import { seed as demoData } from "./fixtures/workspace";
import type { Task } from "../src/types/models";
const task = (value: Partial<Task>): Task => ({
  ...defaults("tasks"),
  id: crypto.randomUUID(),
  userId: "test",
  createdAt: null,
  updatedAt: null,
  ...value,
});
describe("local calendar dates", () => {
  it("uses local dates and crosses month/year boundaries", () => {
    expect(localDate(new Date(2026, 0, 2, 0, 5))).toBe("2026-01-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-03-02", "2026-02-28")).toBe(2);
  });
});
describe("consistent today and deadline logic", () => {
  it("includes scheduled or due today exactly once", () => {
    expect(isToday(task({ scheduledDate: "2026-10-07" }), "2026-10-07")).toBe(
      true,
    );
    expect(isToday(task({ dueDate: "2026-10-07" }), "2026-10-07")).toBe(true);
  });
  it("excludes completed tasks from overdue", () => {
    expect(isOverdue(task({ dueDate: "2026-10-06" }), "2026-10-07")).toBe(true);
    expect(
      isOverdue(
        task({ dueDate: "2026-10-06", completed: true, status: "done" }),
        "2026-10-07",
      ),
    ).toBe(false);
  });
  it("ranks overdue high, today high, today, then deadlines and limits to five", () => {
    const list = [
      task({ title: "later", dueDate: "2026-10-12" }),
      task({ title: "today", scheduledDate: "2026-10-07" }),
      task({ title: "priority", priority: "high", dueDate: "2026-10-07" }),
      task({ title: "overdue", priority: "high", dueDate: "2026-10-01" }),
    ];
    expect(homeTasks(list, "2026-10-07").map((t) => t.title)).toEqual([
      "overdue",
      "priority",
      "today",
      "later",
    ]);
    expect(
      homeTasks(
        Array.from({ length: 20 }, () => task({ dueDate: "2026-10-07" })),
        "2026-10-07",
      ),
    ).toHaveLength(5);
  });
  it("normalizes completion and reopening", () => {
    expect(taskCompletion(true)).toEqual({ status: "done", completed: true });
    expect(taskCompletion(false)).toEqual({ status: "todo", completed: false });
  });
});
describe("project progress", () => {
  it("derives progress and handles zero tasks", () => {
    const data = demoData();
    const project = data.projects[0];
    expect(projectProgress(project, []).percent).toBe(0);
    expect(
      projectProgress(project, [
        task({ projectId: project.id, completed: true }),
        task({ projectId: project.id }),
      ]),
    ).toEqual({ total: 2, done: 1, percent: 50 });
  });
});
describe("combined agenda", () => {
  it("combines task,event,reminder chronologically and avoids due/scheduled duplicates", () => {
    const data = demoData();
    const date = "2026-10-07";
    data.tasks = [
      task({
        id: "one",
        title: "One",
        scheduledDate: date,
        dueDate: date,
        scheduledStart: "14:00",
      }),
    ];
    data.calendarEvents = [
      { ...data.calendarEvents[0], date, startTime: "09:00" },
    ];
    data.reminders = [{ ...data.reminders[0], date, time: "18:00" }];
    expect(agenda(data, date).map((i) => i.type)).toEqual([
      "calendarEvents",
      "tasks",
      "reminders",
    ]);
  });
  it("places unscheduled tasks after timed work", () => {
    const data = demoData();
    data.tasks = [task({ dueDate: "2026-10-07" })];
    data.calendarEvents = [];
    data.reminders = [];
    expect(agenda(data, "2026-10-07")[0].time).toBe("");
  });
});
describe("validation and search", () => {
  it("allows projects without an area and validates timing", () => {
    const data = demoData();
    expect(() =>
      validate("projects", { ...defaults("projects"), name: "New" }, data),
    ).not.toThrow();
    expect(() =>
      validate(
        "tasks",
        { ...defaults("tasks"), title: "Task", scheduledStart: "09:00" },
        data,
      ),
    ).toThrow("scheduled date");
    expect(() =>
      validate(
        "calendarEvents",
        {
          ...defaults("calendarEvents"),
          title: "Event",
          startTime: "12:00",
          endTime: "11:00",
        },
        data,
      ),
    ).toThrow("End time");
  });
  it("searches all requested types and descriptions without case sensitivity", () => {
    const data = demoData();
    data.projects[0].description = "Shared needle";
    data.tasks[0].title = "Shared needle";
    data.inboxItems[0].text = "Shared needle";
    data.reminders[0].title = "Shared needle";
    expect(new Set(search(data, "NEEDLE").map((r) => r.type))).toEqual(
      new Set(["projects", "tasks", "inboxItems", "reminders"]),
    );
    expect(search(data, "")).toEqual([]);
    expect(search(data, "not-found-xyz")).toEqual([]);
  });
});
