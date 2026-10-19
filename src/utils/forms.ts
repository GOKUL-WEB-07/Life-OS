import { validateSubtasks } from "./subtasks";
import type { CollectionName, Input, AppData } from "../types/models";
import { localDate } from "./dates";
export function defaults<K extends CollectionName>(type: K): Input<K> {
  const values: { [P in CollectionName]: Input<P> } = {
    subscriptions: {
      title: "",
      category: "Software",
      amount: 0,
      currency: "INR",
      cycle: "monthly",
      date: localDate(),
      reminderDays: 7,
      active: true,
      description: "",
    },
    documents: {
      title: "",
      category: "ID",
      reference: "",
      location: "",
      date: "",
      reminderDays: 30,
      description: "",
    },
    notes: { title: "", description: "", stage: "seed", archived: false },
    ideas: { title: "", description: "", stage: "seed", archived: false },
    bills: {
      title: "",
      amount: 0,
      currency: "INR",
      date: localDate(),
      completed: false,
      description: "",
    },
    areas: { name: "", color: "#5271bc", order: 0, archived: false },
    projects: {
      name: "",
      areaId: "",
      description: "",
      status: "active",
      priority: "medium",
      startDate: "",
      deadline: "",
      progress: 0,
    },
    tasks: {
      subtasks: [],
      title: "",
      description: "",
      projectId: "",
      areaId: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      scheduledDate: "",
      scheduledStart: "",
      scheduledEnd: "",
      estimatedMinutes: 0,
      completed: false,
      completedAt: null,
    },
    inboxItems: { text: "", type: "unprocessed" },
    calendarEvents: {
      title: "",
      description: "",
      date: localDate(),
      startTime: "",
      endTime: "",
      allDay: false,
    },
    reminders: { title: "", date: localDate(), time: "", completed: false },
  };
  return values[type];
}
export function validate(
  type: CollectionName,
  value: Record<string, unknown>,
  data: AppData,
) {
  if (
    ["subscriptions", "bills"].includes(type) &&
    (!Number.isFinite(Number(value.amount)) || Number(value.amount) < 0)
  )
    throw new Error("Enter a valid amount.");
  if (
    ["subscriptions", "documents"].includes(type) &&
    (!Number.isInteger(Number(value.reminderDays)) ||
      Number(value.reminderDays) < 0 ||
      Number(value.reminderDays) > 365)
  )
    throw new Error("Reminder days must be between 0 and 365.");
  if (["subscriptions", "bills"].includes(type) && !value.date)
    throw new Error("Choose a date.");
  if (type === "tasks") validateSubtasks(value.subtasks);
  const title = String(value.name || value.title || value.text || "").trim();
  if (!title)
    throw new Error(
      "Enter a " +
        (type === "areas" || type === "projects" ? "name" : "title") +
        ".",
    );
  if (title.length > 300)
    throw new Error("Keep the title under 300 characters.");
  if (value.areaId && !data.areas.some((a) => a.id === value.areaId))
    throw new Error("This area no longer exists. Choose another area.");
  if (value.projectId && !data.projects.some((p) => p.id === value.projectId))
    throw new Error("This project no longer exists. Choose another project.");
  if ((type === "reminders" || type === "calendarEvents") && !value.date)
    throw new Error("Choose a date.");
  if (
    type === "projects" &&
    value.startDate &&
    value.deadline &&
    String(value.deadline) < String(value.startDate)
  )
    throw new Error("Deadline must be on or after the start date.");
  if (
    type === "tasks" &&
    (value.scheduledStart || value.scheduledEnd) &&
    !value.scheduledDate
  )
    throw new Error("Choose a scheduled date before adding times.");
  for (const key of [
    "startDate",
    "deadline",
    "dueDate",
    "scheduledDate",
    "date",
  ]) {
    const raw = value[key];
    if (raw) {
      const text = String(raw);
      const parsed = new Date(text + "T00:00:00");
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
        Number.isNaN(parsed.getTime()) ||
        localDate(parsed) !== text
      )
        throw new Error("Enter a valid date.");
    }
  }
  for (const key of [
    "scheduledStart",
    "scheduledEnd",
    "startTime",
    "endTime",
    "time",
  ]) {
    if (value[key] && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value[key])))
      throw new Error("Enter a valid time.");
  }
  const start = String(value.scheduledStart || value.startTime || "");
  const end = String(value.scheduledEnd || value.endTime || "");
  if (end && (!start || end <= start))
    throw new Error("End time must be after the start time.");
  if (
    Number(value.estimatedMinutes) < 0 ||
    Number(value.estimatedMinutes) > 1440
  )
    throw new Error("Estimate must be between 0 and 1440 minutes.");
}
