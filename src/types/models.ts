import type { Timestamp } from "firebase/firestore";
export type Audit = {
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
export type Owned = Audit & { id: string; userId: string };
export type Priority = "high" | "medium" | "low";
export type Area = Owned & {
  name: string;
  color: string;
  order: number;
  archived: boolean;
};
export type Project = Owned & {
  name: string;
  areaId: string;
  description: string;
  status: "planning" | "active" | "paused" | "completed" | "archived";
  priority: Priority;
  startDate: string;
  deadline: string;
  progress: number;
};
export type Subtask = { id: string; title: string; completed: boolean };
export type Task = Owned & {
  subtasks?: Subtask[];
  title: string;
  description: string;
  projectId: string;
  areaId: string;
  status: "todo" | "in-progress" | "blocked" | "done";
  priority: Priority;
  dueDate: string;
  scheduledDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt: Timestamp | null;
};
export type InboxItem = Owned & { text: string; type: "unprocessed" };
export type CalendarEvent = Owned & {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
};
export type Reminder = Owned & {
  title: string;
  date: string;
  time: string;
  completed: boolean;
};
export type UserProfile = Audit & {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  initialized?: boolean;
};
export type Subscription = Owned & {
  title: string;
  category: string;
  amount: number;
  currency: string;
  cycle: "monthly" | "yearly" | "quarterly" | "weekly" | "once";
  date: string;
  reminderDays: number;
  active: boolean;
  description: string;
};
export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  storage: "device";
};
export type WalletDocument = Owned & {
  attachments?: Attachment[];
  title: string;
  category: string;
  reference: string;
  location: string;
  date: string;
  reminderDays: number;
  description: string;
};
export type CaptureNote = Owned & {
  title: string;
  description: string;
  stage: "seed" | "exploring" | "ready";
  archived: boolean;
};
export type Bill = Owned & {
  attachments?: Attachment[];
  title: string;
  amount: number;
  currency: string;
  date: string;
  completed: boolean;
  description: string;
};
export type DataMap = {
  subscriptions: Subscription;
  documents: WalletDocument;
  notes: CaptureNote;
  ideas: CaptureNote;
  bills: Bill;
  areas: Area;
  projects: Project;
  tasks: Task;
  inboxItems: InboxItem;
  calendarEvents: CalendarEvent;
  reminders: Reminder;
};
export type CollectionName = keyof DataMap;
export type AppData = { [K in CollectionName]: DataMap[K][] };
export type Input<K extends CollectionName> = Omit<DataMap[K], keyof Owned>;
export type SessionUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};
export const emptyData: AppData = {
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
};
export const collections: CollectionName[] = [
  "subscriptions",
  "documents",
  "notes",
  "ideas",
  "bills",
  "areas",
  "projects",
  "tasks",
  "inboxItems",
  "calendarEvents",
  "reminders",
];
