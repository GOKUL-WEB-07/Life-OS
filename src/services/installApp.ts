import { useSyncExternalStore } from "react";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
let prompt: InstallPrompt | null = null;
const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
let installed = standalone();
let state = { available: false, installed };
const listeners = new Set<() => void>();
function notify() {
  state = { available: !!prompt, installed };
  listeners.forEach((fn) => fn());
}
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  prompt = event as InstallPrompt;
  notify();
});
window.addEventListener("appinstalled", () => {
  installed = true;
  prompt = null;
  notify();
});
window
  .matchMedia("(display-mode: standalone)")
  .addEventListener("change", () => {
    installed = standalone();
    notify();
  });
export function useInstallApp() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
}
export async function installApp() {
  const deferred = prompt;
  if (!deferred) return "unavailable";
  prompt = null;
  notify();
  await deferred.prompt();
  return (await deferred.userChoice).outcome;
}
