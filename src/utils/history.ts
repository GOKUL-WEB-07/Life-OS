export type HistoryAction = {
  label: string;
  forward: () => Promise<void>;
  backward: () => Promise<void>;
};
export type HistoryState = {
  undoLabel: string;
  redoLabel: string;
  busy: boolean;
};
export class UndoHistory {
  private past: HistoryAction[] = [];
  private future: HistoryAction[] = [];
  private locked = false;
  private listeners = new Set<() => void>();
  private state: HistoryState = { undoLabel: "", redoLabel: "", busy: false };
  getSnapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  private notify() {
    this.state = {
      undoLabel: this.past.at(-1)?.label || "",
      redoLabel: this.future.at(-1)?.label || "",
      busy: this.locked,
    };
    this.listeners.forEach((fn) => fn());
  }
  private async run(work: () => Promise<void>) {
    if (this.locked) throw new Error("Wait for the current action to finish.");
    this.locked = true;
    this.notify();
    try {
      await work();
    } finally {
      this.locked = false;
      this.notify();
    }
  }
  async execute(action: HistoryAction) {
    await this.run(async () => {
      await action.forward();
      this.past.push(action);
      this.past = this.past.slice(-20);
      this.future = [];
    });
  }
  async undo() {
    const action = this.past.at(-1);
    if (!action) return;
    await this.run(async () => {
      await action.backward();
      this.past.pop();
      this.future.push(action);
    });
  }
  async redo() {
    const action = this.future.at(-1);
    if (!action) return;
    await this.run(async () => {
      await action.forward();
      this.future.pop();
      this.past.push(action);
    });
  }
  clear() {
    this.past = [];
    this.future = [];
    this.notify();
  }
}
export function patchAction<T extends object>({
  label,
  before,
  after,
  read,
  write,
}: {
  label: string;
  before: Partial<T>;
  after: Partial<T>;
  read: () => T | undefined;
  write: (value: T) => Promise<void>;
}): HistoryAction {
  async function apply(expected: Partial<T>, patch: Partial<T>) {
    const current = read();
    if (!current) throw new Error("This item no longer exists.");
    for (const key of Object.keys(expected) as (keyof T)[])
      if (JSON.stringify(current[key]) !== JSON.stringify(expected[key]))
        throw new Error(
          "This item changed since that action. Review it before making another change.",
        );
    await write({ ...current, ...patch });
  }
  return {
    label,
    forward: () => apply(before, after),
    backward: () => apply(after, before),
  };
}
