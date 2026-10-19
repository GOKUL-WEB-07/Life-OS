import { localDate } from "../utils/dates";
import { useState, useCallback, type ReactNode } from "react";
import { Editor } from "../features/shared/Editor";
import { EditorContext as Context, type EditorRequest } from "./EditorContext";
export { useEditor, type EditorRequest } from "./EditorContext";
export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<EditorRequest | null>(null);
  const open = useCallback(
    (next: EditorRequest) =>
      setRequest(
        next.type === "tasks" && !next.id
          ? {
              ...next,
              initial: { scheduledDate: localDate(), ...next.initial },
            }
          : next,
      ),
    [],
  );
  return (
    <Context.Provider value={open}>
      {children}
      {request && (
        <Editor
          key={request.type + request.id + request.source}
          request={request}
          onClose={() => setRequest(null)}
        />
      )}
    </Context.Provider>
  );
}
