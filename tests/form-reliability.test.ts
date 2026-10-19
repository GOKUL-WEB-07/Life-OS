import { it, expect } from "vitest";
import { defaults, validate } from "../src/utils/forms";
import { emptyWorkspace } from "../src/services/demoService";
it("rejects impossible dates and malformed times before saving", () => {
  const data = emptyWorkspace();
  expect(() =>
    validate(
      "projects",
      { ...defaults("projects"), name: "Project", startDate: "2026-02-30" },
      data,
    ),
  ).toThrow("valid date");
  expect(() =>
    validate(
      "reminders",
      { ...defaults("reminders"), title: "Call", time: "25:30" },
      data,
    ),
  ).toThrow("valid time");
  expect(() =>
    validate(
      "projects",
      {
        ...defaults("projects"),
        name: "Project",
        startDate: "2028-02-29",
        deadline: "2028-03-01",
      },
      data,
    ),
  ).not.toThrow();
});
it("preserves deadline ordering validation without requiring Areas", () => {
  expect(() =>
    validate(
      "projects",
      {
        ...defaults("projects"),
        name: "Project",
        startDate: "2026-10-20",
        deadline: "2026-10-19",
      },
      emptyWorkspace(),
    ),
  ).toThrow("Deadline");
});
