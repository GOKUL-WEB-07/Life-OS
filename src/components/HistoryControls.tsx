import { Undo2, Redo2 } from "lucide-react";
import { useData } from "../app/providers/DataProvider";
import { useSaveAction } from "../hooks/useSaveAction";
import { useToast } from "./feedback/Feedback";
export function HistoryControls() {
  const { history, undo, redo } = useData();
  const { run, error } = useSaveAction();
  const toast = useToast();
  return (
    <div className="history-controls" role="group" aria-label="Action history">
      <button
        className="history-button"
        type="button"
        disabled={!history.undoLabel || history.busy}
        aria-label="Undo"
        title={
          history.undoLabel ? "Undo: " + history.undoLabel : "Nothing to undo"
        }
        onClick={() =>
          void run(async () => {
            await undo();
            toast("Action undone. Redo is available.");
          })
        }
      >
        <Undo2 size={17} />
        <span>Undo</span>
      </button>
      <button
        className="history-button"
        type="button"
        disabled={!history.redoLabel || history.busy}
        aria-label="Redo"
        title={
          history.redoLabel ? "Redo: " + history.redoLabel : "Nothing to redo"
        }
        onClick={() =>
          void run(async () => {
            await redo();
            toast("Action restored.");
          })
        }
      >
        <Redo2 size={17} />
        <span>Redo</span>
      </button>
      {error && (
        <div className="history-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
