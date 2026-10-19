import { useEffect, useState, type ReactNode } from "react";
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
  async function toggleTask(id: string) {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task no longer exists.");
    await saveItem(
      "tasks",
      { ...task, ...taskCompletion(!task.completed) },
      id,
    );
  }
  async function toggleReminder(id: string) {
    const reminder = data.reminders.find((r) => r.id === id);
    if (!reminder) throw new Error("Reminder no longer exists.");
    await saveItem(
      "reminders",
      { ...reminder, completed: !reminder.completed },
      id,
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
