import { deleteAttachment } from "../../services/attachmentService";
import type { Attachment } from "../../types/models";
import { useNavigate } from "react-router-dom";
import { useSaveAction } from "../../hooks/useSaveAction";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { useData } from "../../app/providers/DataProvider";
import { useToast } from "../../components/feedback/Feedback";
import { useEditor, type EditorRequest } from "../../components/EditorContext";
import { defaults } from "../../utils/forms";
import type { CollectionName, Input } from "../../types/models";
import { EntityFields } from "./EntityFields";
const labels: Record<CollectionName, string> = {
  subscriptions: "subscription",
  documents: "document",
  notes: "note",
  ideas: "idea",
  bills: "bill",
  areas: "area",
  projects: "project",
  tasks: "task",
  inboxItems: "inbox item",
  calendarEvents: "event",
  reminders: "reminder",
};
export function Editor({
  request,
  onClose,
}: {
  request: EditorRequest;
  onClose: () => void;
}) {
  const { data, saveItem, deleteItem } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const open = useEditor();
  const existing = request.id
    ? data[request.type].find((item) => item.id === request.id)
    : undefined;
  const [draft, setDraft] = useState<Record<string, unknown>>({
    ...defaults(request.type),
    ...existing,
    ...request.initial,
  });
  const [uploading, setUploading] = useState(false);
  const seenFiles = useRef(new Map<string, Attachment>());
  const latestFiles = useRef<Attachment[]>([]);
  const committed = useRef(false);
  latestFiles.current = (draft.attachments as Attachment[]) || [];
  latestFiles.current.forEach((f) => seenFiles.current.set(f.id, f));
  const originalFiles = useRef<Attachment[]>(
    existing && "attachments" in existing ? existing.attachments || [] : [],
  );
  useEffect(
    () => () => {
      if (!committed.current) {
        const original = new Set(originalFiles.current.map((f) => f.id));
        Array.from(seenFiles.current.values())
          .filter((f) => !original.has(f.id))
          .forEach((f) => void deleteAttachment(f.id).catch(() => {}));
      }
    },
    [],
  );
  const [advanced, setAdvanced] = useState(Boolean(existing));
  const { busy, pending, error, run } = useSaveAction();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const label = labels[request.type];
  const set = (key: string, value: unknown) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  async function persist(value = draft) {
    if (uploading) return;
    let savedId = "";
    const success = await run(async () => {
      const clean = { ...value };
      for (const key of ["name", "title", "text"])
        if (typeof clean[key] === "string")
          clean[key] = (clean[key] as string).trim();
      savedId = await saveItem(
        request.type,
        clean as Input<CollectionName>,
        request.id,
        request.source,
      );
    });
    if (success) {
      committed.current = true;
      const kept = new Set(latestFiles.current.map((f) => f.id));
      [...originalFiles.current, ...Array.from(seenFiles.current.values())]
        .filter((f) => !kept.has(f.id))
        .forEach((f) => void deleteAttachment(f.id).catch(() => {}));
      toast(
        request.id
          ? "Changes saved."
          : label[0].toUpperCase() + label.slice(1) + " created.",
      );
      onClose();
      if (request.type === "projects" && !request.id)
        navigate("/projects/" + savedId);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = { ...draft };
    for (const [key, raw] of new FormData(event.currentTarget)) {
      if (typeof raw === "string" && key in value)
        value[key] = typeof value[key] === "number" ? Number(raw) : raw;
    }
    await persist(value);
  }
  async function destroy() {
    if (await run(() => deleteItem(request.type, request.id!))) {
      committed.current = true;
      [
        ...originalFiles.current,
        ...Array.from(seenFiles.current.values()),
      ].forEach((f) => void deleteAttachment(f.id).catch(() => {}));
      toast("Item deleted.");
      onClose();
    }
  }
  if (request.id && !existing)
    return (
      <Modal title="Item unavailable" onClose={onClose}>
        <p>This item no longer exists.</p>
      </Modal>
    );
  return (
    <Modal
      title={(request.id ? "Edit " : "New ") + label}
      onClose={() => {
        if (!busy && !uploading) onClose();
      }}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <EntityFields
            type={request.type}
            draft={draft}
            set={set}
            data={data}
            advanced={advanced}
            existing={!!existing}
            onUploadBusy={setUploading}
          />
          {(request.type === "tasks" || request.type === "projects") && (
            <button
              type="button"
              className="text-button disclosure"
              aria-expanded={advanced}
              onClick={() => setAdvanced(!advanced)}
            >
              {advanced ? "Hide details" : "More details"}
            </button>
          )}
          {request.type === "inboxItems" && existing && (
            <div className="conversion">
              <p>Turn this into something actionable</p>
              {(
                ["tasks", "projects", "notes", "ideas", "reminders"] as const
              ).map((type) => (
                <button
                  type="button"
                  className="button secondary"
                  key={type}
                  onClick={() =>
                    open({
                      type,
                      initial: { title: draft.text, name: draft.text },
                      source: request.id,
                    })
                  }
                >
                  Convert to {labels[type]}
                </button>
              ))}
            </div>
          )}
          {pending && (
            <p role="status" className="form-error">
              The save is awaiting confirmation. Check your connection. Keep
              this form open to avoid submitting it twice.
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {confirmDelete ? (
            <div className="delete-confirm">
              <p>Delete this {label}? This cannot be undone.</p>
              <button type="button" className="button danger" onClick={destroy}>
                Confirm delete
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <footer className="form-actions">
              {existing &&
              (request.type === "projects" || request.type === "areas") ? (
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() =>
                    persist({
                      ...draft,
                      ...(request.type === "projects"
                        ? { status: "archived" }
                        : { archived: true }),
                    })
                  }
                >
                  Archive
                </button>
              ) : existing ? (
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div>
                {request.type === "tasks" && existing && (
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      persist({
                        ...draft,
                        status: draft.status === "done" ? "todo" : "done",
                      })
                    }
                  >
                    {draft.status === "done" ? "Reopen" : "Mark complete"}
                  </button>
                )}
                <button type="submit" className="button" disabled={uploading}>
                  {uploading
                    ? "Adding files..."
                    : pending
                      ? "Save pending"
                      : busy
                        ? "Saving…"
                        : request.source
                          ? "Convert"
                          : request.id
                            ? "Save changes"
                            : "Create " + label}
                </button>
              </div>
            </footer>
          )}
        </fieldset>
      </form>
    </Modal>
  );
}
