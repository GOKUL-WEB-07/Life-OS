import { useState, type FormEvent } from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { EmptyState, useToast } from "../../components/feedback/Feedback";
import { errorMessage } from "../../utils/errors";
export function Inbox() {
  const { data, saveItem } = useData();
  const edit = useEditor();
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function capture(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await saveItem("inboxItems", { text: text.trim(), type: "unprocessed" });
      setText("");
      toast("Captured in your inbox.");
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Inbox"
        description="A place for everything on your mind. Organize it when you’re ready."
      />
      <form className="capture-form" onSubmit={capture}>
        <label className="sr-only" htmlFor="capture">
          What’s on your mind?
        </label>
        <input
          id="capture"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What’s on your mind?"
          maxLength={300}
          required
        />
        <button className="button" disabled={busy || !text.trim()}>
          <Plus size={18} />
          {busy ? "Adding…" : "Add"}
        </button>
      </form>
      <div className="section-heading">
        <h2>
          Waiting to be organized
          <span className="count-label">{data.inboxItems.length}</span>
        </h2>
      </div>
      {data.inboxItems.length ? (
        <div className="panel">
          {[...data.inboxItems]
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
            )
            .map((item) => (
              <button
                className="inbox-row"
                key={item.id}
                onClick={() => edit({ type: "inboxItems", id: item.id })}
              >
                <span className="inbox-dot" />
                <span>{item.text}</span>
                <span className="inbox-action">
                  Organize
                  <ArrowUpRight size={16} />
                </span>
              </button>
            ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing waiting here."
          detail="Capture an idea above. No dates or details required."
        />
      )}
    </>
  );
}
