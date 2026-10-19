import { beforeEach, expect, it } from "vitest";
import {
  emptyWorkspace,
  demoData,
  saveDemo,
} from "../src/services/demoService";
import { startDemo } from "../src/services/authService";
import { save, remove } from "../src/services/repository";
import { defaults, validate } from "../src/utils/forms";
import {
  attentionItems,
  dueItems,
  monthly,
  nextRenewal,
} from "../src/utils/life";
import { agenda } from "../src/utils/work";
import { search } from "../src/services/searchService";
beforeEach(() => {
  localStorage.clear();
  startDemo();
  localStorage.setItem("project-os-empty-migration", "1");
  saveDemo(emptyWorkspace());
});
it("migrates existing local storage without losing work", () => {
  localStorage.setItem(
    "project-os-demo-v1",
    JSON.stringify({
      projects: [{ id: "user-project", name: "Existing" }],
      tasks: [],
      areas: [],
      reminders: [],
      calendarEvents: [],
      inboxItems: [],
    }),
  );
  expect(demoData().projects[0].name).toBe("Existing");
  expect(demoData().documents).toEqual([]);
});
it("shares renewal dates across home attention, calendar, and search", async () => {
  const id = await save("subscriptions", {
    ...defaults("subscriptions"),
    title: "Adobe",
    amount: 1200,
    date: "2026-10-19",
  });
  const d = demoData();
  expect(attentionItems(d, "2026-10-18").map((i) => i.id)).toContain(id);
  expect(agenda(d, "2026-10-19").some((i) => i.id === id)).toBe(true);
  expect(search(d, "adobe")[0].id).toBe(id);
  await save(
    "subscriptions",
    { ...d.subscriptions[0], date: "2026-11-19" },
    id,
  );
  expect(attentionItems(demoData(), "2026-10-18")).toEqual([]);
});
it("includes overdue expiry and bills without duplicate reminders", async () => {
  await save("documents", {
    ...defaults("documents"),
    title: "Passport",
    date: "2026-11-15",
  });
  await save("bills", {
    ...defaults("bills"),
    title: "Bill",
    date: "2026-10-10",
  });
  expect(attentionItems(demoData(), "2026-10-18")).toHaveLength(2);
  expect(demoData().reminders).toHaveLength(0);
});
it("calculates monthly equivalents and clamps month end dates", () => {
  expect(
    monthly({
      ...defaults("subscriptions"),
      amount: 1200,
      cycle: "yearly",
    } as any),
  ).toBe(100);
  expect(nextRenewal("2026-01-31", "monthly")).toBe("2026-02-28");
  expect(nextRenewal("2028-02-29", "yearly")).toBe("2029-02-28");
  expect(nextRenewal("2026-10-18", "weekly")).toBe("2026-10-25");
});
it("persists ideas and notes and removes records from search on deletion", async () => {
  const id = await save("ideas", {
    ...defaults("ideas"),
    title: "Garden",
    description: "A balcony garden",
  });
  await save("notes", { ...defaults("notes"), title: "Plant list" });
  expect(search(demoData(), "balcony")[0].id).toBe(id);
  await remove("ideas", id);
  expect(search(demoData(), "balcony")).toEqual([]);
});
it("rejects invalid amount, dates, and reminder windows", () => {
  expect(() =>
    validate(
      "bills",
      { ...defaults("bills"), title: "Bill", amount: -1 },
      emptyWorkspace(),
    ),
  ).toThrow();
  expect(() =>
    validate(
      "documents",
      { ...defaults("documents"), title: "ID", date: "2026-02-30" },
      emptyWorkspace(),
    ),
  ).toThrow();
  expect(() =>
    validate(
      "subscriptions",
      { ...defaults("subscriptions"), title: "Plan", reminderDays: 366 },
      emptyWorkspace(),
    ),
  ).toThrow();
});
