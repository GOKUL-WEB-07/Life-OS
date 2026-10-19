import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight, Orbit, CheckCheck } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { addDays } from "../../utils/dates";
export function WorkspacePulse({ today }: { today: string }) {
  const { data } = useData();
  const done = data.tasks.filter((t) => t.completed).length;
  const total = data.tasks.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const counts = dates.map(
    (date) =>
      data.tasks.filter(
        (t) => !t.completed && (t.scheduledDate || t.dueDate) === date,
      ).length,
  );
  const max = Math.max(1, ...counts);
  const active = data.projects.filter((p) => p.status === "active").length;
  return (
    <section className="pulse-grid" aria-label="Workspace overview">
      <div className="launch-card">
        <div className="launch-copy">
          <span className="spark-tag">
            <Sparkles size={15} /> Make room for great work
          </span>
          <h2>
            Your next chapter.
            <br />
            Starts here.
          </h2>
          <p>
            {total
              ? total -
                done +
                (total - done === 1
                  ? " open task. Find your rhythm today."
                  : " open tasks. Find your rhythm today.")
              : "A fresh workspace, ready for your first idea."}
          </p>
          <Link to="/tasks">
            Find my next step <ArrowUpRight size={18} />
          </Link>
        </div>
        <svg className="orbit-art" viewBox="0 0 240 240" aria-hidden="true">
          <circle
            cx="120"
            cy="120"
            r="83"
            fill="none"
            stroke="#ffffff30"
            strokeWidth="1"
          />
          <ellipse
            cx="120"
            cy="120"
            rx="112"
            ry="45"
            fill="none"
            stroke="#ffffff70"
            strokeWidth="2"
            transform="rotate(-35 120 120)"
          />
          <circle cx="120" cy="120" r="48" fill="#d5f69b" />
          <path
            d="M100 121l14 14 29-31"
            fill="none"
            stroke="#283d55"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="210" cy="64" r="13" fill="#ffad94" />
          <circle cx="40" cy="163" r="9" fill="#b4a1ff" />
          <path
            d="M182 175v22m-11-11h22M55 44v16m-8-8h16"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="completion-card">
        <div className="pulse-title">
          <CheckCheck size={19} />
          <h2>Making progress</h2>
        </div>
        <div className="completion-body">
          <div
            className="completion-ring"
            style={{
              background:
                "conic-gradient(#6c5ce7 " +
                percent +
                "%, var(--surface-subtle) 0)",
            }}
            role="img"
            aria-label={percent + " percent of all tasks complete"}
          >
            <span>
              {percent}
              <small>%</small>
            </span>
          </div>
          <div>
            <strong>
              {done} of {total}
            </strong>
            <p>tasks completed</p>
            <span className="mini-pill">{active} active projects</span>
          </div>
        </div>
        <p className="chart-caption">
          {total
            ? "Every finished task moves things forward."
            : "Add your first task to start tracking progress."}
        </p>
      </div>
      <div className="week-card">
        <div className="pulse-title">
          <Orbit size={19} />
          <h2>The week ahead</h2>
          <span>Open tasks</span>
        </div>
        <div className="week-bars">
          {dates.map((date, i) => (
            <div
              className={"bar-day " + (i === 0 ? "is-today" : "")}
              key={date}
            >
              <strong>{counts[i]}</strong>
              <div className="bar-track">
                <span style={{ height: (counts[i] / max) * 100 + "%" }} />
              </div>
              <small>
                {i === 0
                  ? "Today"
                  : new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
              </small>
            </div>
          ))}
        </div>
        <p className="chart-caption">
          Scheduled tasks, or due dates when unscheduled.
        </p>
      </div>
    </section>
  );
}
