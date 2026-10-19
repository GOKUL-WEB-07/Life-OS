import { expect, it } from "vitest";
import { UndoHistory, patchAction } from "../src/utils/history";
function fixture() {
  let item = { date: "2026-10-19", active: true, title: "Software" };
  const history = new UndoHistory();
  const action = patchAction({
    label: "Paid",
    before: { date: item.date },
    after: { date: "2026-11-19" },
    read: () => item,
    write: async (value) => {
      item = value;
    },
  });
  return {
    history,
    action,
    get: () => item,
    edit: (patch: Partial<typeof item>) => {
      item = { ...item, ...patch };
    },
  };
}
it("undoes and redoes renewal dates while preserving unrelated edits", async () => {
  const f = fixture();
  await f.history.execute(f.action);
  expect(f.get().date).toBe("2026-11-19");
  f.edit({ title: "Changed title" });
  await f.history.undo();
  expect(f.get()).toMatchObject({ date: "2026-10-19", title: "Changed title" });
  await f.history.redo();
  expect(f.get().date).toBe("2026-11-19");
});
it("does not overwrite a subsequent edit to the same field", async () => {
  const f = fixture();
  await f.history.execute(f.action);
  f.edit({ date: "2027-01-01" });
  await expect(f.history.undo()).rejects.toThrow("changed");
  expect(f.get().date).toBe("2027-01-01");
  expect(f.history.getSnapshot().undoLabel).toBe("Paid");
});
it("clears redo after a new action and can clear session history", async () => {
  const f = fixture();
  await f.history.execute(f.action);
  await f.history.undo();
  expect(f.history.getSnapshot().redoLabel).toBe("Paid");
  await f.history.execute(f.action);
  expect(f.history.getSnapshot().redoLabel).toBe("");
  f.history.clear();
  expect(f.history.getSnapshot().undoLabel).toBe("");
});
it("keeps history unchanged after a failed save", async () => {
  const f = fixture();
  await expect(
    f.history.execute({
      label: "Failure",
      forward: async () => {
        throw Error("Offline");
      },
      backward: async () => {},
    }),
  ).rejects.toThrow("Offline");
  expect(f.history.getSnapshot()).toEqual({
    undoLabel: "",
    redoLabel: "",
    busy: false,
  });
});
it("restores task completion and bill payment together as patches", async () => {
  let item = { completed: false, status: "todo" };
  const history = new UndoHistory();
  await history.execute(
    patchAction({
      label: "Complete",
      before: { completed: false, status: "todo" },
      after: { completed: true, status: "done" },
      read: () => item,
      write: async (value) => {
        item = value;
      },
    }),
  );
  await history.undo();
  expect(item).toEqual({ completed: false, status: "todo" });
  await history.redo();
  expect(item).toEqual({ completed: true, status: "done" });
});
