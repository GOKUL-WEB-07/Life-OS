import { useToday } from "../../hooks/useToday";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { DayAgenda } from "../../components/DayAgenda";
import { localDate, dateFrom, addDays, niceDate } from "../../utils/dates";
import { agenda } from "../../utils/work";
export function Calendar() {
  const { data } = useData();
  const today = useToday();
  const open = useEditor();
  const [selected, setSelected] = useState(localDate());
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [view, setView] = useState("month");
  const start = localDate(
    new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay()),
  );
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  function move(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    const day = Math.min(
      dateFrom(selected).getDate(),
      new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(),
    );
    setSelected(localDate(new Date(next.getFullYear(), next.getMonth(), day)));
  }
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Give important work a place in your day."
        action={
          <button
            className="button"
            onClick={() =>
              open({ type: "calendarEvents", initial: { date: selected } })
            }
          >
            <Plus size={18} />
            New event
          </button>
        }
      />
      <div className="calendar-toolbar">
        <div>
          <button
            className="icon-button"
            onClick={() =>
              view === "month" ? move(-1) : setSelected(addDays(selected, -1))
            }
            aria-label="Previous"
          >
            <ChevronLeft size={19} />
          </button>
          <h2>
            {view === "month"
              ? month.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })
              : niceDate(selected)}
          </h2>
          <button
            className="icon-button"
            onClick={() =>
              view === "month" ? move(1) : setSelected(addDays(selected, 1))
            }
            aria-label="Next"
          >
            <ChevronRight size={19} />
          </button>
          <button
            className="button secondary compact"
            onClick={() => {
              setSelected(localDate());
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              );
            }}
          >
            Today
          </button>
        </div>
        <div className="tabs">
          {["month", "agenda"].map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              className={view === v ? "selected" : ""}
              onClick={() => {
                setView(v);
                if (v === "month") {
                  const date = dateFrom(selected);
                  setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}
            >
              {v === "month" ? "Month" : "Agenda / Day"}
            </button>
          ))}
        </div>
      </div>
      {view === "month" && (
        <div className="calendar-grid panel">
          <div className="weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="month-days">
            {days.map((date) => {
              const items = agenda(data, date);
              return (
                <button
                  key={date}
                  aria-label={date + ", " + items.length + " items"}
                  aria-pressed={selected === date}
                  className={
                    "calendar-day " +
                    (selected === date ? "selected " : "") +
                    (dateFrom(date).getMonth() !== month.getMonth()
                      ? "other-month "
                      : "") +
                    (date === today ? "today" : "")
                  }
                  onClick={() => setSelected(date)}
                >
                  <span className="day-number">{dateFrom(date).getDate()}</span>
                  <span className="day-items">
                    {items.slice(0, 2).map((item) => (
                      <span
                        key={item.type + item.id}
                        className={"calendar-indicator " + item.type}
                      >
                        <i />
                        {item.title}
                      </span>
                    ))}
                    {items.length > 2 && (
                      <span className="more-items">
                        +{items.length - 2} more
                      </span>
                    )}
                  </span>
                  <span className="mobile-indicators">
                    {items.slice(0, 3).map((item) => (
                      <i className={item.type} key={item.type + item.id} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <section className="calendar-agenda">
        <div className="section-heading">
          <h2>
            {dateFrom(selected).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <button
            className="text-button"
            onClick={() =>
              open({ type: "tasks", initial: { scheduledDate: selected } })
            }
          >
            <Plus size={16} />
            Schedule task
          </button>
        </div>
        <div className="panel">
          <DayAgenda date={selected} />
        </div>
      </section>
    </>
  );
}
