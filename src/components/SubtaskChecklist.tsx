import { useState } from "react";
import { Plus, ArrowUp, ArrowDown, X } from "lucide-react";
import type { Subtask } from "../types/models";
import { MAX_SUBTASKS, moveSubtask } from "../utils/subtasks";
export function SubtaskChecklist({
  items,
  onChange,
}: {
  items: Subtask[];
  onChange: (items: Subtask[]) => void;
}) {
  const [title, setTitle] = useState("");
  function add() {
    if (!title.trim() || items.length >= MAX_SUBTASKS) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), title: title.trim(), completed: false },
    ]);
    setTitle("");
  }
  return (
    <details className="subtask-checklist">
      <summary>
        Subtasks{" "}
        <span>
          {items.filter((i) => i.completed).length} / {items.length}
        </span>
      </summary>
      <p className="subtask-hint">
        Break this task into smaller steps. Changes save with the task.
      </p>
      <div>
        {items.map((item, index) => (
          <div className="subtask-row" key={item.id}>
            <label className="checkbox-target">
              <input
                type="checkbox"
                checked={item.completed}
                aria-label={(item.completed ? "Reopen subtask " : "Complete subtask ") + (index + 1)}
                onChange={(e) =>
                  onChange(
                    items.map((i) =>
                      i.id === item.id
                        ? { ...i, completed: e.target.checked }
                        : i,
                    ),
                  )
                }
              />
            </label>
            <input
              value={item.title}
              aria-label={"Subtask " + (index + 1)}
              maxLength={300}
              required
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === item.id ? { ...i, title: e.target.value } : i,
                  ),
                )
              }
            />
            <div className="subtask-controls">
              <button
                type="button"
                className="icon-button"
                aria-label={"Move subtask " + (index + 1) + " up"}
                disabled={index === 0}
                onClick={() => onChange(moveSubtask(items, item.id, -1))}
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={"Move subtask " + (index + 1) + " down"}
                disabled={index === items.length - 1}
                onClick={() => onChange(moveSubtask(items, item.id, 1))}
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={"Remove subtask " + (index + 1)}
                onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length < MAX_SUBTASKS ? (
        <div className="subtask-add">
          <input
            aria-label="New subtask"
            placeholder="Add a small step"
            value={title}
            maxLength={300}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button
            type="button"
            className="button secondary"
            disabled={!title.trim()}
            onClick={add}
          >
            <Plus size={16} />
            Add step
          </button>
        </div>
      ) : (
        <p>20 subtasks maximum.</p>
      )}
      <p className="subtask-hint">
        Completing steps does not automatically complete the parent task.
      </p>
    </details>
  );
}
