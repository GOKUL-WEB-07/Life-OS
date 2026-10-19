import { it, expect, vi } from "vitest";
import {
  demoData,
  emptyWorkspace,
  watchDemo,
} from "../src/services/demoService";
it("refreshes local snapshots on another tabs storage update and cleans up", () => {
  localStorage.clear();
  localStorage.setItem("project-os-empty-migration", "1");
  let handler: ((event: { key: string | null }) => void) | undefined;
  const remove = vi.fn();
  vi.stubGlobal("window", {
    addEventListener: (_name: string, fn: typeof handler) => {
      handler = fn;
    },
    removeEventListener: remove,
  });
  try {
    let calls = 0;
    const stop = watchDemo(() => {
      calls++;
      demoData();
    });
    localStorage.setItem(
      "project-os-demo-v1",
      JSON.stringify(emptyWorkspace()),
    );
    handler?.({ key: "other-key" });
    expect(calls).toBe(1);
    handler?.({ key: "project-os-demo-v1" });
    expect(calls).toBe(2);
    stop();
    expect(remove).toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
