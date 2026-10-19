import { AttachmentPicker } from "../../components/Attachments";
import type { Attachment } from "../../types/models";
import { SubtaskChecklist } from "../../components/SubtaskChecklist";
import type { Subtask } from "../../types/models";
import { Field } from "../../components/ui/Fields";
import type { AppData, CollectionName } from "../../types/models";
type Props = {
  type: CollectionName;
  draft: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  data: AppData;
  advanced: boolean;
  existing: boolean;
  onUploadBusy?: (busy: boolean) => void;
};
export function EntityFields({
  type,
  draft,
  set,
  data,
  advanced,
  existing,
  onUploadBusy,
}: Props) {
  const text = (
    key: string,
    label: string,
    inputType = "text",
    required = false,
  ) => (
    <Field label={label} key={key}>
      <input
        name={key}
        autoFocus={["title", "name", "text"].includes(key)}
        type={inputType}
        value={String(draft[key] ?? "")}
        onChange={(e) =>
          set(
            key,
            inputType === "number" ? Number(e.target.value) : e.target.value,
          )
        }
        required={required}
        maxLength={inputType === "text" ? 300 : undefined}
        min={inputType === "number" ? 0 : undefined}
        max={inputType === "number" ? 1440 : undefined}
      />
    </Field>
  );
  const select = (
    key: string,
    label: string,
    options: { id: string; name: string }[],
    empty?: string,
  ) => (
    <Field key={key} label={label}>
      <select
        value={String(draft[key] ?? "")}
        onChange={(e) => {
          set(key, e.target.value);
          if (key === "projectId") {
            const p = data.projects.find((p) => p.id === e.target.value);
            if (p) set("areaId", p.areaId);
          }
        }}
        required={key === "areaId" && type === "projects"}
      >
        {empty && <option value="">{empty}</option>}
        {options.map((o) => (
          <option value={o.id} key={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </Field>
  );
  const description = (
    <Field label="Description">
      <textarea
        rows={3}
        value={String(draft.description ?? "")}
        onChange={(e) => set("description", e.target.value)}
        maxLength={5000}
      />
    </Field>
  );
  const priority = select(
    "priority",
    "Priority",
    ["high", "medium", "low"].map((id) => ({
      id,
      name: id[0].toUpperCase() + id.slice(1),
    })),
  );
  const areas = data.areas
    .filter((a) => !a.archived || a.id === draft.areaId)
    .sort((a, b) => a.order - b.order);
  const area = select(
    "areaId",
    "Area",
    areas,
    type === "projects" ? "Choose an area" : "No area",
  );
  if (["subscriptions", "documents", "notes", "ideas", "bills"].includes(type))
    return (
      <>
        {text("title", "Title", "text", true)}
        {["subscriptions", "documents"].includes(type) &&
          text("category", "Category")}
        {type === "documents" && (
          <>
            <p className="page-note">
              Keep references and where to find the original. Avoid full ID
              numbers or credentials on a shared device.
            </p>
            {text("reference", "Reference / last 4 characters")}
            {text("location", "Original location or secure storage link")}
          </>
        )}
        {["subscriptions", "bills"].includes(type) && (
          <div className="form-grid">
            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={Number(draft.amount)}
                onChange={(e) => set("amount", Number(e.target.value))}
              />
            </Field>
            {select(
              "currency",
              "Currency",
              ["INR", "USD", "EUR", "GBP"].map((id) => ({ id, name: id })),
            )}
          </div>
        )}
        {type === "subscriptions" && (
          <>
            {select(
              "cycle",
              "Billing cycle",
              ["monthly", "yearly", "quarterly", "weekly", "once"].map(
                (id) => ({ id, name: id }),
              ),
            )}
            <label className="check-field">
              <input
                type="checkbox"
                checked={Boolean(draft.active)}
                onChange={(e) => set("active", e.target.checked)}
              />
              Active
            </label>
          </>
        )}
        {["subscriptions", "documents", "bills"].includes(type) &&
          text(
            "date",
            type === "documents" ? "Expiry date (optional)" : "Next due date",
            "date",
            type !== "documents",
          )}
        {["subscriptions", "documents"].includes(type) && (
          <Field label="Remind me days before">
            <input
              type="number"
              min="0"
              max="365"
              required
              value={Number(draft.reminderDays)}
              onChange={(e) => set("reminderDays", Number(e.target.value))}
            />
          </Field>
        )}
        {["notes", "ideas"].includes(type) && (
          <>
            {select(
              "stage",
              "Stage",
              ["seed", "exploring", "ready"].map((id) => ({ id, name: id })),
            )}
            <label className="check-field">
              <input
                type="checkbox"
                checked={Boolean(draft.archived)}
                onChange={(e) => set("archived", e.target.checked)}
              />
              Archived
            </label>
          </>
        )}
        {type === "bills" && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={Boolean(draft.completed)}
              onChange={(e) => set("completed", e.target.checked)}
            />
            Paid
          </label>
        )}
        {description}
        {["documents", "bills"].includes(type) && (
          <AttachmentPicker
            files={(draft.attachments as Attachment[]) || []}
            onChange={(files) => set("attachments", files)}
            onBusy={onUploadBusy}
          />
        )}
      </>
    );
  if (type === "areas")
    return (
      <>
        {text("name", "Name", "text", true)}
        <Field label="Color">
          <input
            type="color"
            value={String(draft.color)}
            onChange={(e) => set("color", e.target.value)}
          />
        </Field>
        {text("order", "Order", "number")}
        <label className="check-field">
          <input
            type="checkbox"
            checked={Boolean(draft.archived)}
            onChange={(e) => set("archived", e.target.checked)}
          />
          Archived
        </label>
      </>
    );
  if (type === "inboxItems")
    return <>{text("text", "What’s on your mind?", "text", true)}</>;
  if (type === "reminders")
    return (
      <>
        {text("title", "Title", "text", true)}
        <div className="form-grid">
          {text("date", "Date", "date", true)}
          {text("time", "Time", "time")}
        </div>
        {existing && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={Boolean(draft.completed)}
              onChange={(e) => set("completed", e.target.checked)}
            />
            Completed
          </label>
        )}
      </>
    );
  if (type === "calendarEvents")
    return (
      <>
        {text("title", "Title", "text", true)}
        {text("date", "Date", "date", true)}
        <label className="check-field">
          <input
            type="checkbox"
            checked={Boolean(draft.allDay)}
            onChange={(e) => {
              set("allDay", e.target.checked);
              if (e.target.checked) {
                set("startTime", "");
                set("endTime", "");
              }
            }}
          />
          All-day event
        </label>
        {!draft.allDay && (
          <div className="form-grid">
            {text("startTime", "Start time", "time")}
            {text("endTime", "End time", "time")}
          </div>
        )}
        {description}
      </>
    );
  if (type === "projects")
    return (
      <>
        {text("name", "Name", "text", true)}
        {advanced && (
          <>
            {description}
            <div className="form-grid">
              {select(
                "status",
                "Status",
                ["planning", "active", "paused", "completed", "archived"].map(
                  (id) => ({ id, name: id[0].toUpperCase() + id.slice(1) }),
                ),
              )}
              {priority}
              {text("startDate", "Start date", "date")}
              {text("deadline", "Deadline", "date")}
            </div>
          </>
        )}
      </>
    );
  return (
    <>
      {text("title", "Task", "text", true)}
      {text("dueDate", "Due date", "date")}
      <SubtaskChecklist
        items={(draft.subtasks as Subtask[]) || []}
        onChange={(items) => set("subtasks", items)}
      />
      {advanced && (
        <>
          {description}
          <div className="form-grid">
            {select(
              "projectId",
              "Project",
              data.projects.filter(
                (p) => p.status !== "archived" || p.id === draft.projectId,
              ),
              "No project",
            )}
            {select(
              "status",
              "Status",
              ["todo", "in-progress", "blocked", "done"].map((id) => ({
                id,
                name: (
                  {
                    todo: "To do",
                    "in-progress": "In progress",
                    blocked: "Blocked",
                    done: "Done",
                  } as Record<string, string>
                )[id],
              })),
            )}
            {priority}
            {text("scheduledDate", "Scheduled date", "date")}
            {text("scheduledStart", "Start time", "time")}
            {text("scheduledEnd", "End time", "time")}
            {text("estimatedMinutes", "Estimated minutes", "number")}
          </div>
        </>
      )}
    </>
  );
}
