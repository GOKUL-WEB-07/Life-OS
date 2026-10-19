import { deleteAttachment } from "./attachmentService";
import type { AppData } from "../types/models";
import { Timestamp } from "firebase/firestore";
const key = "project-os-demo-v1";
const listeners = new Set<() => void>();
export const emptyWorkspace = (): AppData => ({
  subscriptions: [],
  documents: [],
  notes: [],
  ideas: [],
  bills: [],
  areas: [],
  projects: [],
  tasks: [],
  inboxItems: [],
  calendarEvents: [],
  reminders: [],
});
function revive(_key: string, value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    "nanoseconds" in value
  )
    return new Timestamp(Number(value.seconds), Number(value.nanoseconds));
  return value;
}
export function demoData(): AppData {
  const stored = localStorage.getItem(key);
  const data: AppData = stored
    ? { ...emptyWorkspace(), ...JSON.parse(stored, revive) }
    : emptyWorkspace();
  if (localStorage.getItem("project-os-empty-migration") !== "1") {
    const bundled: Partial<Record<keyof AppData, RegExp>> = {
      areas: /^area-[0-3]$/,
      projects: /^project-[0-3]$/,
      tasks: /^task-[0-5]$/,
      inboxItems: /^inbox-0$/,
      calendarEvents: /^event-0$/,
      reminders: /^reminder-0$/,
    };
    for (const type of Object.keys(bundled) as (keyof AppData)[]) {
      Object.assign(data, {
        [type]: data[type].filter((item) => !bundled[type]!.test(item.id)),
      });
    }
    // Retain user-created work while removing references to bundled examples.
    data.tasks = data.tasks.map((t) => ({
      ...t,
      projectId: data.projects.some((p) => p.id === t.projectId)
        ? t.projectId
        : "",
      areaId: data.areas.some((a) => a.id === t.areaId) ? t.areaId : "",
    }));
    data.projects = data.projects.map((p) => ({
      ...p,
      areaId: data.areas.some((a) => a.id === p.areaId) ? p.areaId : "",
    }));
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem("project-os-empty-migration", "1");
  }
  return data;
}
export function saveDemo(data: AppData) {
  localStorage.setItem(key, JSON.stringify(data));
  listeners.forEach((fn) => fn());
}
export function watchDemo(callback: () => void) {
  listeners.add(callback);
  callback();
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) callback();
  };
  if (typeof window !== "undefined")
    window.addEventListener("storage", storage);
  return () => {
    if (typeof window !== "undefined")
      window.removeEventListener("storage", storage);
    listeners.delete(callback);
  };
}
export function resetDemo() {
  const data = demoData();
  const files = [...data.documents, ...data.bills].flatMap(
    (item) => item.attachments || [],
  );
  saveDemo(emptyWorkspace());
  files.forEach((file) => void deleteAttachment(file.id).catch(() => {}));
}
