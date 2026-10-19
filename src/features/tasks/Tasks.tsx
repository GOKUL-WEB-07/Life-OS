import { useSaveAction } from "../../hooks/useSaveAction";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useToday } from "../../hooks/useToday";
import { PageHeader } from "../../components/ui/Fields";
import { TaskList } from "../../components/TaskList";
import { useToast } from "../../components/feedback/Feedback";
import { defaults } from "../../utils/forms";
import { localDate } from "../../utils/dates";
import { dailyTasks } from "../../utils/dailyTasks";
export function Tasks() {
  const { data, saveItem } = useData();
  const today = useToday();
  const toast = useToast();
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const { busy, pending, error, run } = useSaveAction();
  const [filter, setFilter] = useState("today");
  const tasks =
    filter === "today"
      ? dailyTasks(data.tasks, today)
      : data.tasks.filter((t) =>
          filter === "completed" ? t.completed : !t.completed,
        );
  const completed = tasks.filter((t) => t.completed).length;
  async function add(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    const title = text.trim();
    if (
      await run(() =>
        saveItem("tasks", {
          ...defaults("tasks"),
          title,
          scheduledDate: localDate(),
        }),
      )
    ) {
      setText("");
      toast("Added to today’s to-do list.");
    }
  }

  return (
    <section className="everyday-panel">
      <PageHeader
        title="My everyday"
        description={new Date(today + "T00:00:00").toLocaleDateString(
          undefined,
          { weekday: "long", month: "long", day: "numeric" },
        )}
      />
      <div className="tabs detail-tabs">
        {["today", "all open", "completed"].map((f) => (
          <button
            key={f}
            className={filter === f ? "selected" : ""}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "today"
              ? "Today"
              : f === "completed"
                ? "Completed"
                : "All open"}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          {tasks.length - completed} remaining{" "}
          <span className="count-label">{completed} completed</span>
        </h2>
        {filter === "today" && (
          <span className="daily-reset-note">
            Fresh list every day at 12:00 AM
          </span>
        )}
      </div>
      <div className="panel">
        <TaskList
          tasks={tasks}
          empty={
            filter === "today"
              ? "A fresh day, a fresh list."
              : "No tasks in this view."
          }
        />
      </div>
      {composing ? (
        <div>
          {" "}
          <form className="capture-form" onSubmit={add}>
            <label className="sr-only" htmlFor="daily-todo">
              Add a to-do
            </label>
            <input
              id="daily-todo"
              disabled={busy || pending}
              aria-describedby={error ? "todo-add-error" : undefined}
              placeholder="What do you need to do today?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              required
            />
            <button
              type="submit"
              className="button"
              disabled={busy || pending || !text.trim()}
            >
              <Plus size={18} />
              {pending ? "Save pending" : busy ? "Adding…" : "Add"}
            </button>
          </form>
          {pending && (
            <p role="status" className="form-error">
              Saving is taking longer than usual. Check your connection; keep
              this entry open to avoid adding it twice.
            </p>
          )}
          {error && (
            <p id="todo-add-error" className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <button className="add-task-bottom" onClick={() => setComposing(true)}>
          <Plus size={23} />
          Add task
        </button>
      )}
      <p className="daily-history-note">
        Previous days stay saved in Calendar. Unfinished items do not carry
        over.
      </p>
    </section>
  );
}
