import { validateSubtasks } from "../utils/subtasks";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { currentUser, isDemo } from "./authService";
import { demoData, saveDemo, watchDemo } from "./demoService";
import type { CollectionName, DataMap, Input } from "../types/models";
export function observe<K extends CollectionName>(
  name: K,
  callback: (items: DataMap[K][]) => void,
  onError: (error: Error) => void,
) {
  const uid = currentUser().uid;
  if (isDemo())
    return watchDemo(() => {
      try {
        callback(demoData()[name]);
      } catch (error) {
        onError(error as Error);
      }
    });
  if (!db) throw new Error("Firebase is not configured.");
  return onSnapshot(
    query(collection(db, name), where("userId", "==", uid)),
    (snapshot) =>
      callback(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as DataMap[K]),
      ),
    onError,
  );
}
export async function save<K extends CollectionName>(
  name: K,
  input: Input<K>,
  id?: string,
  sourceInboxId?: string,
) {
  const uid = currentUser().uid;
  const generated = id || crypto.randomUUID();
  const clean = { ...input } as Record<string, unknown>;
  delete clean.userId;
  delete clean.id;
  delete clean.createdAt;
  delete clean.updatedAt;
  if (name === "tasks") {
    validateSubtasks(clean.subtasks);
    if (Array.isArray(clean.subtasks))
      clean.subtasks = clean.subtasks.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        completed: item.completed,
      }));
    clean.completed = clean.status === "done";
    clean.completedAt = clean.completed
      ? isDemo()
        ? Timestamp.now()
        : serverTimestamp()
      : null;
    if (clean.projectId) {
      const project = isDemo()
        ? demoData().projects.find((p) => p.id === clean.projectId)
        : db
          ? (await getDoc(doc(db, "projects", String(clean.projectId)))).data()
          : undefined;
      if (!project || project.userId !== uid)
        throw new Error("Project is unavailable. Choose another project.");
      clean.areaId = project.areaId;
    }
    if (id && clean.completed) {
      const previous = isDemo()
        ? demoData().tasks.find((t) => t.id === id)
        : db
          ? (await getDoc(doc(db, "tasks", id))).data()
          : undefined;
      if (previous?.completed) clean.completedAt = previous.completedAt;
    }
  }
  if (isDemo()) {
    const data = demoData();
    const items = data[name] as DataMap[K][];
    const previous = items.find((x) => x.id === generated);
    if (id && !previous) throw new Error("This item no longer exists.");
    const item = {
      ...previous,
      ...clean,
      id: generated,
      userId: uid,
      createdAt: previous?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as DataMap[K];
    (data[name] as DataMap[K][]) = [
      ...items.filter((x) => x.id !== generated),
      item,
    ];
    if (sourceInboxId) {
      if (!data.inboxItems.some((x) => x.id === sourceInboxId))
        throw new Error("Inbox item no longer exists.");
      data.inboxItems = data.inboxItems.filter((x) => x.id !== sourceInboxId);
    }
    saveDemo(data);
    return generated;
  }
  if (!db) throw new Error("Firebase is not configured.");
  const batch = writeBatch(db);
  const ref = doc(db, name, generated);
  if (id) batch.update(ref, { ...clean, updatedAt: serverTimestamp() });
  else
    batch.set(ref, {
      ...clean,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  if (sourceInboxId) batch.delete(doc(db, "inboxItems", sourceInboxId));
  await batch.commit();
  return generated;
}
export async function remove<K extends CollectionName>(name: K, id: string) {
  currentUser();
  if (name === "projects" || name === "areas")
    throw new Error("Archive this item instead of deleting it.");
  if (isDemo()) {
    const data = demoData();
    (data[name] as DataMap[K][]) = data[name].filter(
      (x) => x.id !== id,
    ) as DataMap[K][];
    saveDemo(data);
    return;
  }
  if (!db) throw new Error("Firebase is not configured.");
  const batch = writeBatch(db);
  batch.delete(doc(db, name, id));
  await batch.commit();
}
export function makeService<K extends CollectionName>(name: K) {
  return {
    observe: (
      callback: (items: DataMap[K][]) => void,
      onError: (error: Error) => void,
    ) => observe(name, callback, onError),
    save: (input: Input<K>, id?: string, sourceInboxId?: string) =>
      save(name, input, id, sourceInboxId),
    remove: (id: string) => remove(name, id),
  };
}
