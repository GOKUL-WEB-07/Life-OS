import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpRight, Orbit, ShieldCheck } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { useToday } from "../../hooks/useToday";
import { addDays, dateFrom } from "../../utils/dates";
import { attentionItems, dueItems, money } from "../../utils/life";
import { isToday, projectProgress } from "../../utils/work";
export function Home() {
  const { data } = useData();
  const { user } = useAuth();
  const open = useEditor();
  const today = useToday();
  const hour = new Date().getHours();
  const name =
    user?.displayName && user.displayName !== "Your workspace"
      ? user.displayName.split(" ")[0]
      : "Gokul";
  const attention = attentionItems(data, today);
  const upcoming = dueItems(data).filter(
    (i) => i.date >= today && i.date <= addDays(today, 7),
  );
  const active = data.projects.filter((p) =>
    ["active", "planning", "paused"].includes(p.status),
  );
  const totals = Object.entries(
    data.subscriptions
      .filter((s) => s.active && s.date.slice(0, 7) === today.slice(0, 7))
      .reduce(
        (a, s) => {
          a[s.currency] = (a[s.currency] || 0) + s.amount;
          return a;
        },
        {} as Record<string, number>,
      ),
  );
  const recent = Object.entries(data)
    .filter(([k]) => k !== "areas")
    .flatMap(([type, items]) => items.map((i) => ({ type, item: i })))
    .filter(
      ({ item }) =>
        !("archived" in item && item.archived) &&
        !("status" in item && item.status === "archived"),
    )
    .sort(
      (a, b) =>
        (b.item.updatedAt?.seconds || 0) - (a.item.updatedAt?.seconds || 0),
    )
    .slice(0, 5);
  return (
    <>
      <div className="life-greeting">
        <div>
          <p>
            {dateFrom(today).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1>
            Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"},{" "}
            {name}.
          </h1>
        </div>
        <Link className="button" to="/search" aria-label="Global search">
          <Search size={18} />
          Global search
        </Link>
      </div>
      <section className="life-hero cinematic-hero">
        <img
          className="hero-backdrop"
          src="/art/projects-feature.png"
          alt="Creative project planning with task cards, models and a timeline"
        />
        <div className="hero-shade" />
        <div>
          <span className="hero-caption">Your space. Your pace.</span>
          <h2>
            A little clarity.
            <br />A lot more life.
          </h2>
          <p>
            Work, ideas, and the details of everyday life.
            <br />
            Together, so you can focus on what comes next.
          </p>
          <Link to="/tasks" className="button">
            Plan today <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="orbit-art" aria-hidden="true" hidden>
          <Orbit />
          <span className="orbit-core">
            life<span>OS</span>
          </span>
        </div>
      </section>
      <div className="explore-heading">
        <h2>Your collection</h2>
        <span>A place for every part of life</span>
      </div>
      <section className="collection-shelf" aria-label="Explore your life">
        {[
          {
            to: "/projects",
            title: "Make it happen",
            label: "Projects & work",
            className: "work",
            meta: active.length + " active projects",
          },
          {
            to: "/documents",
            title: "Keep it close",
            label: "Your document wallet",
            className: "documents",
            meta: data.documents.length + " documents",
          },
          {
            to: "/ideas",
            title: "Follow the spark",
            label: "Ideas & brainstorming",
            className: "ideas",
            meta: data.ideas.length + " ideas",
          },
        ].map((card) => (
          <Link
            className={"collection-card collection-" + card.className}
            to={card.to}
            key={card.to}
          >
            <span className="collection-image" />
            <span className="collection-shade" />
            <span className="collection-content">
              <small>{card.label}</small>
              <strong>{card.title}</strong>
              <span>
                {card.meta}
                <ArrowUpRight size={18} />
              </span>
            </span>
          </Link>
        ))}
      </section>
      <section className="today-strip" aria-label="Today">
        {[
          [
            data.tasks.filter(
              (t) => !t.completed && t.priority === "high" && isToday(t, today),
            ).length,
            "Priority tasks",
            "/tasks",
          ],
          [
            data.calendarEvents.filter((e) => e.date === today).length,
            "Events",
            "/calendar",
          ],
          [
            dueItems(data).filter(
              (i) => ["tasks", "projects"].includes(i.type) && i.date === today,
            ).length,
            "Deadlines",
            "/calendar",
          ],
          [
            data.subscriptions.filter((s) => s.active && s.date === today)
              .length,
            "Renewals due",
            "/subscriptions",
          ],
        ].map(([n, label, to]) => (
          <Link key={label} to={String(to)}>
            <strong>{n}</strong>
            <span>{label}</span>
            <ArrowUpRight size={17} />
          </Link>
        ))}
      </section>
      <div className="home-columns">
        <section className="panel section-pad">
          <div className="section-heading">
            <h2>Attention needed</h2>
            <Link to="/reminders">View all</Link>
          </div>
          {attention.slice(0, 5).map((i) => (
            <button
              key={i.type + i.id}
              className="life-row"
              onClick={() => open({ type: i.type, id: i.id })}
            >
              <span
                className={i.date < today ? "status-dot overdue" : "status-dot"}
              />
              <span>
                {i.title}
                <small>
                  {i.date < today ? "Overdue - " : "Due - "}
                  {i.date}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
          {data.tasks
            .filter((t) => t.status === "blocked")
            .slice(0, 2)
            .map((t) => (
              <button
                className="life-row"
                key={t.id}
                onClick={() => open({ type: "tasks", id: t.id })}
              >
                Blocked: {t.title}
              </button>
            ))}
          {!attention.length && (
            <div className="calm-empty">
              <ShieldCheck />
              <h3>You're all caught up.</h3>
              <p>Approaching deadlines and renewals will appear here.</p>
            </div>
          )}
        </section>
        <section className="panel section-pad">
          <div className="section-heading">
            <h2>Upcoming - next 7 days</h2>
            <Link to="/calendar">Calendar</Link>
          </div>
          {upcoming.slice(0, 6).map((i) => (
            <button
              className="life-row"
              key={i.type + i.id}
              onClick={() => open({ type: i.type, id: i.id })}
            >
              <span className="date-tile">
                {dateFrom(i.date).toLocaleDateString("en", {
                  weekday: "short",
                })}
                <b>{dateFrom(i.date).getDate()}</b>
              </span>
              <span>
                {i.title}
                <small>{i.type}</small>
              </span>
            </button>
          ))}
          {!upcoming.length && (
            <p className="calm-empty">
              A clear week ahead. Add a date to a record to see it here.
            </p>
          )}
        </section>
      </div>
      <section className="home-projects">
        <div className="section-heading">
          <h2>Active projects</h2>
          <Link to="/projects">
            All projects <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="life-project-grid">
          {active.slice(0, 4).map((p, i) => {
            const progress = projectProgress(p, data.tasks);
            return (
              <Link
                to={"/projects/" + p.id}
                className={"life-project tone-" + i}
                key={p.id}
              >
                <span>{p.status}</span>
                <h3>{p.name}</h3>
                <p>
                  {progress.done} of {progress.total} tasks complete
                </p>
                <progress max={100} value={progress.percent} />
                <strong>{progress.percent}%</strong>
              </Link>
            );
          })}
          <button
            className="new-project-tile"
            onClick={() => open({ type: "projects" })}
          >
            <Plus />
            <span>Create a project</span>
          </button>
        </div>
      </section>
      <div className="home-columns">
        <section className="panel section-pad">
          <h2>Life admin</h2>
          <Link className="life-row" to="/subscriptions">
            <span>Subscriptions this month</span>
            <strong>
              {totals.map(([c, n]) => money(n, c)).join(" + ") || money(0)}
            </strong>
          </Link>
          <Link className="life-row" to="/documents">
            <span>Documents needing attention</span>
            <strong>
              {attention.filter((i) => i.type === "documents").length}
            </strong>
          </Link>
          <Link className="life-row" to="/finance">
            <span>Bills / renewals pending</span>
            <strong>
              {
                attention.filter((i) =>
                  ["bills", "subscriptions"].includes(i.type),
                ).length
              }
            </strong>
          </Link>
        </section>
        <section className="panel section-pad">
          <h2>Recent activity</h2>
          {recent.map(({ type, item }) => (
            <button
              className="life-row"
              key={type + item.id}
              onClick={() =>
                open({ type: type as keyof typeof data, id: item.id })
              }
            >
              <span>
                {"name" in item
                  ? item.name
                  : "text" in item
                    ? item.text
                    : item.title}
                <small>{type} - updated</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
          {!recent.length && <p>Your latest changes will appear here.</p>}
        </section>
      </div>
    </>
  );
}
