import type { AppData, CollectionName, Subscription } from "../types/models";
import { addDays, localDate } from "./dates";
export const money = (n: number, c = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 2,
  }).format(n);
export function monthly(s: Subscription) {
  return s.active
    ? s.amount *
        {
          monthly: 1,
          yearly: 1 / 12,
          quarterly: 1 / 3,
          weekly: 52 / 12,
          once: 0,
        }[s.cycle]
    : 0;
}
export function nextRenewal(date: string, cycle: Subscription["cycle"]) {
  const d = new Date(date + "T00:00:00");
  const day = d.getDate();
  if (cycle === "weekly") return addDays(date, 7);
  const months = { monthly: 1, quarterly: 3, yearly: 12, once: 0 }[cycle];
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  d.setDate(
    Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
  );
  return localDate(d);
}
export type Due = {
  id: string;
  type: CollectionName;
  title: string;
  date: string;
  lead: number;
};
export function dueItems(data: AppData): Due[] {
  return [
    ...data.tasks
      .filter((t) => !t.completed && t.dueDate)
      .map((t) => ({
        id: t.id,
        type: "tasks" as const,
        title: t.title,
        date: t.dueDate,
        lead: 1,
      })),
    ...data.projects
      .filter(
        (p) => !["archived", "completed"].includes(p.status) && p.deadline,
      )
      .map((p) => ({
        id: p.id,
        type: "projects" as const,
        title: p.name + " deadline",
        date: p.deadline,
        lead: 7,
      })),
    ...data.subscriptions
      .filter((s) => s.active)
      .map((s) => ({
        id: s.id,
        type: "subscriptions" as const,
        title: s.title + " renewal",
        date: s.date,
        lead: s.reminderDays,
      })),
    ...data.documents
      .filter((d) => d.date)
      .map((d) => ({
        id: d.id,
        type: "documents" as const,
        title: d.title + " expiry",
        date: d.date,
        lead: d.reminderDays,
      })),
    ...data.bills
      .filter((b) => !b.completed)
      .map((b) => ({
        id: b.id,
        type: "bills" as const,
        title: b.title + " payment",
        date: b.date,
        lead: 7,
      })),
    ...data.calendarEvents.map((e) => ({
      id: e.id,
      type: "calendarEvents" as const,
      title: e.title,
      date: e.date,
      lead: 1,
    })),
    ...data.reminders
      .filter((r) => !r.completed)
      .map((r) => ({
        id: r.id,
        type: "reminders" as const,
        title: r.title,
        date: r.date,
        lead: 0,
      })),
  ]
    .filter((i) => i.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export const attentionItems = (data: AppData, today = localDate()) =>
  dueItems(data).filter((i) => i.date <= addDays(today, i.lead));
