import { useSaveAction } from "../hooks/useSaveAction";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Bell, CheckSquare } from "lucide-react";
import { useData } from "../app/providers/DataProvider";
import { useEditor } from "./QuickAdd";
import { useToast, EmptyState } from "./feedback/Feedback";
import { agenda, type AgendaItem } from "../utils/work";
import { errorMessage } from "../utils/errors";
export function CalendarItem({ item }: { item: AgendaItem }) {
  const { toggleTask, toggleReminder } = useData();
  const open = useEditor();
  const toast = useToast();
  const { busy, pending, error, run } = useSaveAction();
  const Icon =
    item.type === "tasks"
      ? CheckSquare
      : item.type === "reminders"
        ? Bell
        : CalendarDays;
  return (
    <div className={"agenda-item " + (item.completed ? "completed" : "")}>
      <span className="agenda-time">{item.time || "Any time"}</span>
      <Icon size={17} className={"agenda-icon " + item.type} />
      <div className="task-main">
        <button
          className="row-title"
          onClick={() => open({ type: item.type, id: item.id })}
        >
          {item.title}
        </button>
        {pending && (
          <p role="status" className="row-save-feedback">
            Completion is awaiting confirmation.
          </p>
        )}
        {error && (
          <p role="alert" className="row-save-feedback danger-text">
            {error}
          </p>
        )}
        <div className="task-meta">
          <span>
            {item.type === "calendarEvents"
              ? "Event"
              : item.type === "tasks"
                ? "Task"
                : item.type === "projects"
                  ? "Project"
                  : item.type === "subscriptions"
                    ? "Renewal"
                    : item.type === "documents"
                      ? "Document expiry"
                      : item.type === "bills"
                        ? "Bill"
                        : "Reminder"}
            {item.end ? " · ends " + item.end : ""}
          </span>
          {item.projectId && (
            <Link to={"/projects/" + item.projectId}>Open project</Link>
          )}
        </div>
      </div>
      {(item.type === "tasks" || item.type === "reminders") && (
        <label className="checkbox-target">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={item.completed}
            disabled={busy}
            aria-label={(item.completed ? "Reopen " : "Complete ") + item.title}
            onChange={() => {
              void run(() =>
                (item.type === "tasks" ? toggleTask : toggleReminder)(item.id),
              );
            }}
          />
        </label>
      )}
    </div>
  );
}
export function DayAgenda({
  date,
  grouped = false,
}: {
  date: string;
  grouped?: boolean;
}) {
  const { data } = useData();
  const items = agenda(data, date);
  if (!items.length)
    return (
      <EmptyState
        title="Nothing scheduled."
        detail="Add a task, event, or reminder for this day."
      />
    );
  if (!grouped)
    return (
      <div className="agenda-list">
        {items.map((item) => (
          <CalendarItem key={item.type + item.id} item={item} />
        ))}
      </div>
    );
  const groups = [
    { name: "Morning", test: (i: AgendaItem) => !!i.time && i.time < "12:00" },
    {
      name: "Afternoon",
      test: (i: AgendaItem) => i.time >= "12:00" && i.time < "17:00",
    },
    { name: "Evening", test: (i: AgendaItem) => i.time >= "17:00" },
    { name: "Unscheduled today", test: (i: AgendaItem) => !i.time },
  ];
  return (
    <>
      {groups.map((group) => {
        const rows = items.filter(group.test);
        return rows.length ? (
          <section className="day-group" key={group.name}>
            <h2>
              {group.name}
              <span>{rows.length}</span>
            </h2>
            <div className="panel">
              {rows.map((item) => (
                <CalendarItem key={item.type + item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null;
      })}
    </>
  );
}
