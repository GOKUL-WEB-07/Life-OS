import { useSyncExternalStore } from "react";
import { currentUser } from "./authService";
import type { Attachment } from "../types/models";
export type ProfilePreferences = {
  bio: string;
  role: string;
  location: string;
  avatar?: Attachment;
  banner?: Attachment;
  cover: string;
  accent: string;
};
const fallback: ProfilePreferences = {
  bio: "Make space for what matters.",
  role: "Designing my everyday",
  location: "",
  cover: "alpine",
  accent: "#638cff",
};
const listeners = new Set<() => void>();
const key = () => "life-os-profile-" + currentUser().uid;
const snapshot = () => localStorage.getItem(key()) || "";
function subscribe(fn: () => void) {
  listeners.add(fn);
  const update = (e: StorageEvent) => {
    if (e.key === key()) fn();
  };
  window.addEventListener("storage", update);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", update);
  };
}
export function useProfilePreferences() {
  const raw = useSyncExternalStore(subscribe, snapshot, snapshot);
  try {
    return { ...fallback, ...JSON.parse(raw || "{}") } as ProfilePreferences;
  } catch {
    return fallback;
  }
}
export function saveProfilePreferences(value: ProfilePreferences) {
  localStorage.setItem(key(), JSON.stringify(value));
  listeners.forEach((fn) => fn());
}
