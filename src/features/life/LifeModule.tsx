import { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Lightbulb,
  CreditCard,
  ArrowUpRight,
  Pencil,
  CalendarDays,
  Check,
} from "lucide-react";
import {
  AttachmentGallery,
  useAttachmentUrl,
} from "../../components/Attachments";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { EmptyState } from "../../components/feedback/Feedback";
import { money, monthly, nextRenewal } from "../../utils/life";
import { useSaveAction } from "../../hooks/useSaveAction";
import { useToday } from "../../hooks/useToday";
import { addDays, dateFrom } from "../../utils/dates";
import type { DataMap } from "../../types/models";
const cardDate = (value: string) =>
  dateFrom(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
type LifeType = "subscriptions" | "documents" | "notes" | "ideas" | "bills";
const cycleLabel: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  weekly: "Weekly",
  once: "One-time",
};
function RecordCard({
  type,
  item,
}: {
  type: LifeType;
  item: DataMap[LifeType];
}) {
  const open = useEditor();
  const { updateWithHistory, history } = useData();
  const { run, busy, error } = useSaveAction();
  const today = useToday();
  const files = "attachments" in item ? item.attachments || [] : [];
  const photo = files.find((f) => f.type.startsWith("image/"));
  const { url } = useAttachmentUrl(photo);
  const cover = ["documents", "bills", "ideas"].includes(type);
  const art =
    import.meta.env.BASE_URL +
    "art/" +
    (type === "ideas" ? "ideas" : "documents") +
    "-feature.png";
  const label =
    type === "ideas"
      ? "idea"
      : type === "documents"
        ? "document"
        : type === "bills"
          ? "bill"
          : "note";
  const edit = () => open({ type, id: item.id });
  const disabled = busy || history.busy;
  return (
    <article
      className={
        "detail-card detail-card-" + type + (cover ? " has-cover" : "")
      }
    >
      {cover && (
        <button
          className={"detail-card-media " + (url ? "has-document-photo" : "")}
          type="button"
          aria-label={"Open " + item.title}
          onClick={edit}
        >
          <img
            src={url || art}
            alt={
              url
                ? item.title + " attachment preview"
                : type === "ideas"
                  ? "A light bulb and connected brainstorming notes"
                  : "Organized documents and receipts"
            }
          />
          {"category" in item && item.category && (
            <span className="media-label">{item.category}</span>
          )}
          {"stage" in item && <span className="media-label">{item.stage}</span>}
        </button>
      )}
      <div className="detail-card-body">
        <header className="detail-card-heading">
          {!cover && (
            <span className="detail-card-icon">
              {type === "subscriptions" ? (
                <CreditCard size={21} />
              ) : (
                <FileText size={21} />
              )}
            </span>
          )}
          <div>
            <button className="detail-title" type="button" onClick={edit}>
              <h2>{item.title}</h2>
            </button>
            {"category" in item && !cover && (
              <span className="detail-category">{item.category}</span>
            )}
          </div>
          <button
            className="icon-button edit-card"
            aria-label={"Edit " + item.title}
            onClick={edit}
          >
            <Pencil size={16} />
          </button>
        </header>
        {item.description && (
          <p className="detail-description">{item.description}</p>
        )}
        {"cycle" in item && (
          <>
            <div className="invoice-summary">
              <div className="invoice-caption">
                <span>Next renewal</span>
                <span
                  className={"state-pill " + (item.active ? "is-active" : "")}
                >
                  {item.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="invoice-amount">
                {money(item.amount, item.currency)}
                <small>
                  /{" "}
                  {item.cycle === "once"
                    ? "one-time"
                    : item.cycle.replace("ly", "")}
                </small>
              </div>
              <div className="invoice-date">
                <CalendarDays size={15} />
                {cardDate(item.date)}
              </div>
            </div>
            <dl className="card-facts">
              <div>
                <dt>Billing cycle</dt>
                <dd>{cycleLabel[item.cycle]}</dd>
              </div>
              <div>
                <dt>Reminder</dt>
                <dd>{item.reminderDays} days before</dd>
              </div>
            </dl>
          </>
        )}
        {type === "documents" && "location" in item && (
          <dl className="card-facts">
            <div>
              <dt>Expiry date</dt>
              <dd
                className={item.date && item.date < today ? "danger-text" : ""}
              >
                {item.date ? cardDate(item.date) : "No expiry"}
              </dd>
            </div>
            <div>
              <dt>Reminder</dt>
              <dd>{item.reminderDays} days before</dd>
            </div>
            {item.reference && (
              <div>
                <dt>Reference</dt>
                <dd>{item.reference}</dd>
              </div>
            )}
            <div className="wide-fact">
              <dt>Original location</dt>
              <dd>{item.location || "Not added yet"}</dd>
            </div>
          </dl>
        )}
        {type === "bills" && "amount" in item && "completed" in item && (
          <>
            <div className="invoice-summary">
              <div className="invoice-caption">
                <span>Bill amount</span>
                <span
                  className={
                    "state-pill " + (item.completed ? "is-active" : "")
                  }
                >
                  {item.completed ? "Paid" : "Pending"}
                </span>
              </div>
              <div className="invoice-amount">
                {money(item.amount, item.currency)}
              </div>
              <div className="invoice-date">
                <CalendarDays size={15} />
                Due {cardDate(item.date)}
              </div>
            </div>
          </>
        )}
        {"stage" in item && !cover && (
          <div className="note-stage">
            <span className="state-pill">{item.stage}</span>
          </div>
        )}
        {!!files.length && (
          <details className="card-attachments">
            <summary>
              {files.length} attached {files.length === 1 ? "file" : "files"}
            </summary>
            <AttachmentGallery files={files} />
          </details>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <footer className="detail-card-footer">
          {"cycle" in item ? (
            <button
              className="card-action"
              disabled={disabled || !item.active}
              onClick={() =>
                void run(() =>
                  updateWithHistory(
                    "subscriptions",
                    item.id,
                    {
                      active: item.cycle !== "once",
                      date: nextRenewal(item.date, item.cycle),
                    },
                    "Renewal marked paid",
                  ),
                )
              }
            >
              {busy ? "Saving..." : "Mark paid & advance"}
              <ArrowUpRight size={17} />
            </button>
          ) : type === "bills" && "completed" in item ? (
            <button
              className="card-action"
              disabled={disabled}
              onClick={() =>
                void run(() =>
                  updateWithHistory(
                    "bills",
                    item.id,
                    { completed: !item.completed },
                    item.completed ? "Bill marked unpaid" : "Bill marked paid",
                  ),
                )
              }
            >
              {item.completed ? "Mark unpaid" : "Mark paid"}
              <Check size={17} />
            </button>
          ) : (
            <button className="card-action" onClick={edit}>
              View {label}
              <ArrowUpRight size={17} />
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
export function LifeModule({ type }: { type: LifeType }) {
  const { data } = useData();
  const open = useEditor();
  const today = useToday();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all");
  useEffect(() => {
    setQuery("");
    setFilter("all");
    setStatus("all");
  }, [type]);
  const titles = {
    subscriptions: "Subscriptions",
    documents: "Document wallet",
    notes: "Notes",
    ideas: "Ideas & brainstorming",
    bills: "Finance",
  };
  const details = {
    subscriptions: "A clear view of what you pay, and what renews next.",
    documents: "Your important documents, organized and within reach.",
    notes: "Your thoughts and references, all in one place.",
    ideas: "Capture a spark. Give it room to grow.",
    bills: "Your bills, receipts, and upcoming payments.",
  };
  const filters =
    type === "subscriptions"
      ? [
          ["all", "All"],
          ["monthly", "Monthly"],
          ["quarterly", "Quarterly"],
          ["yearly", "Yearly"],
          ["weekly", "Weekly"],
          ["once", "One-time"],
        ]
      : type === "documents"
        ? [
            ["all", "All documents"],
            ["soon", "Expiring soon"],
            ["expired", "Expired"],
            ["no-expiry", "No expiry"],
          ]
        : type === "bills"
          ? [
              ["all", "All bills"],
              ["pending", "Pending"],
              ["paid", "Paid"],
            ]
          : [
              ["all", "All"],
              ["seed", "Seed"],
              ["exploring", "Exploring"],
              ["ready", "Ready"],
            ];
  const rows = data[type].filter((i) => {
    if ("archived" in i && i.archived) return false;
    if (
      !(
        i.title +
        " " +
        i.description +
        ("category" in i ? " " + i.category : "")
      )
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    if (type === "subscriptions" && "cycle" in i)
      return (
        (filter === "all" || i.cycle === filter) &&
        (status === "all" || (status === "active" ? i.active : !i.active))
      );
    if (type === "documents" && "location" in i)
      return (
        filter === "all" ||
        (filter === "expired"
          ? !!i.date && i.date < today
          : filter === "soon"
            ? !!i.date &&
              i.date >= today &&
              i.date <= addDays(today, i.reminderDays)
            : !i.date)
      );
    if (type === "bills" && "completed" in i)
      return (
        filter === "all" || (filter === "paid" ? i.completed : !i.completed)
      );
    return filter === "all" || ("stage" in i && i.stage === filter);
  });
  const totals = Object.entries(
    data.subscriptions.reduce(
      (a, s) => {
        a[s.currency] = (a[s.currency] || 0) + monthly(s);
        return a;
      },
      {} as Record<string, number>,
    ),
  );
  return (
    <>
      <PageHeader
        title={titles[type]}
        description={details[type]}
        action={
          <button className="button" onClick={() => open({ type })}>
            <Plus size={18} />
            Add{" "}
            {type === "subscriptions"
              ? "subscription"
              : type === "documents"
                ? "document"
                : type === "bills"
                  ? "bill"
                  : type === "ideas"
                    ? "idea"
                    : "note"}
          </button>
        }
      />
      {type === "subscriptions" && totals.length > 0 && (
        <div className="commitment-summary">
          {totals.map(([currency, total]) => (
            <div key={currency} className="commitment-pair">
              <div>
                <span>Monthly commitment</span>
                <strong>{money(total, currency)}</strong>
              </div>
              <div>
                <span>Yearly equivalent</span>
                <strong>{money(total * 12, currency)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="records-toolbar">
        <div
          className="tabs segmented-tabs"
          aria-label={titles[type] + " filters"}
        >
          {filters.map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={filter === id ? "selected" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {type === "subscriptions" && (
          <select
            className="compact-filter"
            aria-label="Subscription status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        )}
        <input
          className="record-search"
          type="search"
          aria-label="Filter records"
          placeholder="Filter records..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {rows.length ? (
        <div className="detail-card-grid">
          {rows.map((item) => (
            <RecordCard key={item.id} type={type} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            query || filter !== "all"
              ? "No matching records"
              : "Nothing here yet."
          }
          detail="Use the add button to create your first record."
        />
      )}
      {type === "documents" && (
        <p className="storage-caption">
          Document photos and PDFs are stored on this device. Keep a backup of
          important originals.
        </p>
      )}
    </>
  );
}
