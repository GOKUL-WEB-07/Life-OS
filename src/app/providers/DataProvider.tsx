import { UndoHistory, patchAction } from "../../utils/history";
import { useToast } from "../../components/feedback/Feedback";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  collections,
  emptyData,
  type AppData,
  type CollectionName,
  type Input,
} from "../../types/models";
import { observe, save, remove } from "../../services/repository";
import { validate } from "../../utils/forms";
import { taskCompletion } from "../../utils/work";
import { errorMessage } from "../../utils/errors";
import { useAuth } from "./AuthProvider";
import { DataContext as Context } from "./DataContext";
export { useData } from "./DataContext";
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const dataRef = useRef(data);
  dataRef.current = data;
  const [historyManager] = useState(() => new UndoHistory());
  const history = useSyncExternalStore(
    historyManager.subscribe,
    historyManager.getSnapshot,
    historyManager.getSnapshot,
  );
  const toast = useToast();
  useEffect(() => {
    historyManager.clear();
  }, [user?.uid, historyManager]);
  useEffect(() => {
    setData(emptyData);
    setLoading(true);
    setError("");
    const ready = new Set<string>();
    const stops = collections.map((name) =>
      observe(
        name,
        (items) => {
          ready.add(name);
          setData((previous) => ({ ...previous, [name]: items }));
          if (ready.size === collections.length) setLoading(false);
        },
        (err) => {
          setError(errorMessage(err));
          setLoading(false);
        },
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [user?.uid, revision]);
  async function saveItem<K extends CollectionName>(
    type: K,
    input: Input<K>,
    id?: string,
    source?: string,
  ) {
    validate(type, input as unknown as Record<string, unknown>, data);
    return save(type, input, id, source);
  }
  async function updateWithHistory<K extends CollectionName>(
    type: K,
    id: string,
    patch: Partial<Input<K>>,
    label: string,
  ) {
    const current = dataRef.current[type].find((item) => item.id === id);
    if (!current) throw new Error("This item no longer exists.");
    const before = Object.fromEntries(
      Object.keys(patch).map((key) => [
        key,
        (current as unknown as Record<string, unknown>)[key],
      ]),
    );
    await historyManager.execute(
      patchAction<Record<string, unknown>>({
        label,
        before,
        after: patch as Record<string, unknown>,
        read: () =>
          dataRef.current[type].find((item) => item.id === id) as unknown as
            Record<string, unknown> | undefined,
        write: async (value) => {
          validate(type, value, dataRef.current);
          await save(type, value as Input<K>, id);
        },
      }),
    );
    toast(label + ". Undo is available in the toolbar.");
  }
  async function toggleTask(id: string) {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task no longer exists.");
    await updateWithHistory(
      "tasks",
      id,
      taskCompletion(!task.completed),
      task.completed ? "Task reopened" : "Task completed",
    );
  }
  async function toggleReminder(id: string) {
    const reminder = data.reminders.find((r) => r.id === id);
    if (!reminder) throw new Error("Reminder no longer exists.");
    await updateWithHistory(
      "reminders",
      id,
      { completed: !reminder.completed },
      reminder.completed ? "Reminder reopened" : "Reminder completed",
    );
  }
  const relatedData = {
    ...data,
    tasks: data.tasks.map((task) => {
      const project = data.projects.find((p) => p.id === task.projectId);
      return project ? { ...task, areaId: project.areaId } : task;
    }),
  };
  return (
    <Context.Provider
      value={{
        data: relatedData,
        history,
        undo: () => historyManager.undo(),
        redo: () => historyManager.redo(),
        updateWithHistory,
        loading,
        error,
        retry: () => setRevision((r) => r + 1),
        saveItem,
        deleteItem: remove,
        toggleTask,
        toggleReminder,
      }}
    >
      {children}
    </Context.Provider>
  );
}
