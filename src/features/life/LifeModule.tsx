import { AttachmentGallery } from "../../components/Attachments";
import { useState } from "react";
import {
  Plus,
  FileText,
  Lightbulb,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { EmptyState } from "../../components/feedback/Feedback";
import { money, monthly, nextRenewal } from "../../utils/life";
import { useSaveAction } from "../../hooks/useSaveAction";
import { useToday } from "../../hooks/useToday";
import type { CollectionName } from "../../types/models";
export function LifeModule({
  type,
}: {
  type: "subscriptions" | "documents" | "notes" | "ideas" | "bills";
}) {
  const { data, saveItem } = useData();
  const open = useEditor();
  const today = useToday();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const { run, busy, error } = useSaveAction();
  const titles = {
    subscriptions: "Subscriptions",
    documents: "Document wallet",
    notes: "Notes",
    ideas: "Ideas & brainstorming",
    bills: "Finance",
  };
  const details = {
    subscriptions:
      "Know what renews next and what your recurring commitments cost.",
    documents: "What you have, where it is, and when it expires.",
    notes: "A quiet place to keep your thoughts and useful references.",
    ideas: "Capture a spark. Explore the possibilities. Make it real.",
    bills: "Keep bills, EMIs, and upcoming payments in view.",
  };
  const rows = data[type].filter(
    (i) =>
      (!("archived" in i) || !i.archived) &&
      JSON.stringify(i).toLowerCase().includes(query.toLowerCase()) &&
      (stage === "all" || ("stage" in i && i.stage === stage)),
  );
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
      <div className={"module-heading module-heading-" + type}>
        <PageHeader
          title={titles[type]}
          description={details[type]}
          action={
            <button className="button" onClick={() => open({ type })}>
              <Plus size={18} />
              Add{" "}
              {type === "bills"
                ? "bill"
                : type === "ideas"
                  ? "idea"
                  : type === "documents"
                    ? "document"
                    : type.slice(0, -1)}
            </button>
          }
        />
        {["documents", "ideas", "bills"].includes(type) && (
          <img
            className="module-art"
            src={
              type === "ideas"
                ? import.meta.env.BASE_URL + "art/ideas-feature.png"
                : import.meta.env.BASE_URL + "art/documents-feature.png"
            }
            alt={
              type === "ideas"
                ? "A light bulb and connected sketch notes symbolize brainstorming"
                : "A folder with documents, an ID and receipt"
            }
          />
        )}
      </div>
      {type === "subscriptions" && (
        <div className="life-stats">
          {totals.length ? (
            totals.map(([c, n]) => (
              <div className="panel" key={c}>
                <small>Monthly equivalent - {c}</small>
                <h2>{money(n, c)}</h2>
                <span>{money(n * 12, c)} / year</span>
              </div>
            ))
          ) : (
            <div className="panel">No recurring commitments yet.</div>
          )}
        </div>
      )}
      {type === "documents" && (
        <p className="wallet-notice">
          <FileText size={20} />
          Add document scans and original-file references. Attached files are
          stored on this device; keep a backup of important originals.
        </p>
      )}
      <div className="module-tools">
        <input
          aria-label="Filter records"
          type="search"
          placeholder="Filter by name or details..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {["ideas", "notes"].includes(type) && (
          <select
            aria-label="Filter stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            {["all", "seed", "exploring", "ready"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {rows.length ? (
        <div className={type === "ideas" ? "idea-board" : "record-grid"}>
          {rows.map((item) => (
            <article className={"record-card " + type} key={item.id}>
              <span className="record-icon">
                {type === "ideas" ? (
                  <Lightbulb />
                ) : type === "subscriptions" || type === "bills" ? (
                  <CreditCard />
                ) : (
                  <FileText />
                )}
              </span>
              <button
                className="row-title"
                onClick={() => open({ type, id: item.id })}
              >
                <h2>{item.title}</h2>
              </button>
              {"category" in item && (
                <span className="record-tag">{item.category}</span>
              )}
              {"stage" in item && (
                <span className="record-tag">{item.stage}</span>
              )}
              <p className="record-description">
                {item.description ||
                  (type === "ideas"
                    ? "Open this idea to explore your thoughts, questions, and next steps."
                    : "Add details to keep everything in one place.")}
              </p>
              {"amount" in item && (
                <h3>
                  {money(item.amount, item.currency)}{" "}
                  {"cycle" in item && <small>/ {item.cycle}</small>}
                </h3>
              )}
              {"location" in item && (
                <p>
                  Original: {item.location || "Location not set"}
                  {item.reference && (
                    <>
                      <br />
                      Reference: {item.reference}
                    </>
                  )}
                </p>
              )}
              {"attachments" in item && (
                <AttachmentGallery files={item.attachments} />
              )}
              {"date" in item && item.date && (
                <p className={item.date < today ? "danger-text" : ""}>
                  {type === "documents" ? "Expires" : "Due"} {item.date}
                </p>
              )}
              {"active" in item && (
                <>
                  <span>{item.active ? "Active" : "Paused"}</span>
                  <button
                    className="text-button"
                    disabled={busy || !item.active}
                    onClick={() =>
                      void run(() =>
                        saveItem(
                          "subscriptions",
                          {
                            ...item,
                            active: item.cycle !== "once",
                            date: nextRenewal(item.date, item.cycle),
                          },
                          item.id,
                        ),
                      )
                    }
                  >
                    Mark paid & advance <ArrowRight size={15} />
                  </button>
                </>
              )}
              {type === "bills" && "completed" in item && (
                <button
                  className="button secondary compact"
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      saveItem(
                        "bills",
                        { ...item, completed: !item.completed },
                        item.id,
                      ),
                    )
                  }
                >
                  {item.completed ? "Paid - undo" : "Mark paid"}
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query ? "No matching records" : "Make room for what matters."}
          detail="Use the add button to create your first record."
        />
      )}
    </>
  );
}
