import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface StoredProgress {
  done: string[];
  lastVisited?: string;
  startedAt?: string;
}

const listeners: Array<(event: CustomEvent<StoredProgress>) => void> = [];
const store = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    store.delete(key);
  }),
};

function dispatchEvent(event: CustomEvent<StoredProgress>): boolean {
  for (const listener of listeners) listener(event);
  return true;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  store.clear();
  listeners.length = 0;
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("CustomEvent", CustomEvent);
  vi.stubGlobal("window", {
    dispatchEvent,
    addEventListener(_type: string, listener: (event: CustomEvent<StoredProgress>) => void) {
      listeners.push(listener);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("progress persistence", () => {
  it("still dispatches progress when storage write throws", async () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("quota exceeded");
    });
    const events: StoredProgress[] = [];
    window.addEventListener("ct:progress", (event) => {
      events.push((event as CustomEvent<StoredProgress>).detail);
    });

    const { markDone } = await import("./progress");
    expect(() => markDone("welcome")).not.toThrow();

    expect(events).toHaveLength(1);
    expect(events[0].done).toEqual(["welcome"]);
  });

  it("still dispatches reset when storage remove throws", async () => {
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new Error("storage disabled");
    });
    const events: StoredProgress[] = [];
    window.addEventListener("ct:progress", (event) => {
      events.push((event as CustomEvent<StoredProgress>).detail);
    });

    const { reset } = await import("./progress");
    expect(() => reset()).not.toThrow();

    expect(events).toEqual([{ done: [] }]);
  });
});
