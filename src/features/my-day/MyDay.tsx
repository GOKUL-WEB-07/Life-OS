import { useToday } from "../../hooks/useToday";
import { Link } from "react-router-dom";
import { useData } from "../../app/providers/DataProvider";
import { PageHeader } from "../../components/ui/Fields";
import { TaskList } from "../../components/TaskList";
import { isToday, isOverdue } from "../../utils/work";
import { DayAgenda } from "../../components/DayAgenda";
export function MyDay() {
  const { data } = useData();
  const today = useToday();
  const due = data.tasks.filter((t) => !t.completed && isToday(t, today));
  const overdue = data.tasks.filter(
    (t) => isOverdue(t, today) && !isToday(t, today),
  );
  const scheduled =
    data.calendarEvents.some((e) => e.date === today) ||
    data.reminders.some((r) => r.date === today);
  return (
    <>
      <PageHeader
        title="Today"
        description={new Date(today + "T00:00:00").toLocaleDateString(
          undefined,
          { weekday: "long", month: "long", day: "numeric" },
        )}
      />
      <div className="simple-day-summary">
        <span>
          {due.length} {due.length === 1 ? "task" : "tasks"} for today
        </span>
        <Link to="/tasks">View all tasks</Link>
      </div>
      <section className="panel">
        <TaskList tasks={due} empty="Nothing planned for today." />
      </section>
      {overdue.length > 0 && (
        <section className="simple-section">
          <h2>
            Overdue <span className="count-label">{overdue.length}</span>
          </h2>
          <div className="panel">
            <TaskList tasks={overdue} />
          </div>
        </section>
      )}
      {scheduled && (
        <details className="simple-section optional-tools">
          <summary>Events and reminders for today</summary>
          <DayAgenda date={today} />
        </details>
      )}
    </>
  );
}
