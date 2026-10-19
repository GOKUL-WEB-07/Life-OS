import { attentionItems } from "../../utils/life";
import { useToday } from "../../hooks/useToday";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { CalendarItem } from "../../components/DayAgenda";
import { EmptyState } from "../../components/feedback/Feedback";
import { localDate, addDays, niceDate } from "../../utils/dates";
export function Reminders() {
  const { data } = useData();
  const open = useEditor();
  const [filter, setFilter] = useState("today");
  const today = useToday();
  const tomorrow = addDays(today, 1);
  const reminders = data.reminders
    .filter((r) =>
      filter === "completed"
        ? r.completed
        : !r.completed &&
          (filter === "today"
            ? r.date === today
            : filter === "tomorrow"
              ? r.date === tomorrow
              : filter === "overdue"
                ? r.date < today
                : r.date > tomorrow),
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
  return (
    <>
      <PageHeader
        title="Reminders"
        description="Remember the little things. Make space for the big ones."
        action={
          <button
            className="button"
            onClick={() => open({ type: "reminders" })}
          >
            <Plus size={18} />
            New reminder
          </button>
        }
      />
      <section className="panel section-pad">
        <h2>Across your life</h2>
        <p>
          Due and approaching dates from tasks, projects, renewals, documents,
          bills, and events.
        </p>
        {attentionItems(data, today).map((i) => (
          <button
            className="search-result"
            key={i.type + i.id}
            onClick={() => open({ type: i.type, id: i.id })}
          >
            <span>{i.title}</span>
            <span>{i.date}</span>
          </button>
        ))}
        {!attentionItems(data, today).length && (
          <p>Nothing needs attention right now.</p>
        )}
      </section>
      <h2>Personal reminders</h2>
      <div className="tabs detail-tabs">
        {["today", "tomorrow", "upcoming", "overdue", "completed"].map((f) => (
          <button
            key={f}
            className={filter === f ? "selected" : ""}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {reminders.length ? (
        <div className="panel">
          {reminders.map((r) => (
            <div key={r.id}>
              <p className="reminder-date">{niceDate(r.date)}</p>
              <CalendarItem
                item={{
                  id: r.id,
                  type: "reminders",
                  title: r.title,
                  time: r.time,
                  end: "",
                  completed: r.completed,
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reminders."
          detail="Add something you want to remember."
        />
      )}
      <p className="page-note">
        Reminders appear here and in your calendar. Device notifications aren’t
        included in V1.
      </p>
    </>
  );
}
