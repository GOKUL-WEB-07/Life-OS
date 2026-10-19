import { currentUser } from "./authService";
import type { Attachment } from "../types/models";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_FILES = "image/jpeg,image/png,image/webp,application/pdf";
export function validateAttachment(file: Pick<File, "type" | "size" | "name">) {
  if (
    !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
      file.type,
    )
  )
    throw new Error("Choose a JPG, PNG, WebP image or PDF.");
  if (file.size <= 0 || file.size > MAX_FILE_BYTES)
    throw new Error("Choose a file between 1 byte and 10 MB.");
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("life-os-files", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("File storage is unavailable in this browser."));
  });
}
async function transact<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", mode);
    const request = action(tx.objectStore("files"));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = () => {
      db.close();
      reject(
        new Error("Could not save the file. Check available device storage."),
      );
    };
    tx.onabort = tx.onerror;
  });
}
const key = (id: string) => currentUser().uid + ":" + id;
export async function storeAttachment(file: File): Promise<Attachment> {
  validateAttachment(file);
  const id = crypto.randomUUID();
  await transact("readwrite", (s) => s.put(file, key(id)));
  return {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    storage: "device",
  };
}
export async function attachmentBlob(file: Attachment): Promise<Blob> {
  const blob = await transact<Blob | undefined>("readonly", (s) =>
    s.get(key(file.id)),
  );
  if (!blob)
    throw new Error(
      "This file is not on this device. Open the browser where you added it.",
    );
  return blob;
}
export async function deleteAttachment(id: string) {
  await transact("readwrite", (s) => s.delete(key(id)));
}
