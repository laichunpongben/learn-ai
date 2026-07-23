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

const KEY = "learn-ai.progress.v1";

describe("read() data integrity", () => {
  it("recovers from corrupt JSON without throwing", async () => {
    store.set(KEY, "{not valid json");
    const { getDone } = await import("./progress");
    expect(() => getDone()).not.toThrow();
    expect(getDone()).toEqual([]);
  });

  it("returns empty when stored done is not an array", async () => {
    store.set(KEY, JSON.stringify({ done: "welcome" }));
    const { getDone } = await import("./progress");
    expect(getDone()).toEqual([]);
  });

  it("filters non-string entries out of done", async () => {
    store.set(KEY, JSON.stringify({ done: ["welcome", 42, null, "capabilities"] }));
    const { getDone } = await import("./progress");
    expect(getDone()).toEqual(["welcome", "capabilities"]);
  });

  it("preserves valid lastVisited and startedAt", async () => {
    store.set(
      KEY,
      JSON.stringify({ done: ["welcome"], lastVisited: "chat-first", startedAt: "2026-01-01T00:00:00.000Z" }),
    );
    const { getProgress } = await import("./progress");
    expect(getProgress()).toEqual({
      done: ["welcome"],
      lastVisited: "chat-first",
      startedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("ignores non-string lastVisited/startedAt", async () => {
    store.set(KEY, JSON.stringify({ done: [], lastVisited: 5, startedAt: {} }));
    const { getProgress } = await import("./progress");
    expect(getProgress()).toEqual({ done: [] });
  });
});

describe("progress mutators", () => {
  it("markDone adds an id and is idempotent", async () => {
    const { markDone, getDone } = await import("./progress");
    markDone("welcome");
    markDone("welcome");
    expect(getDone()).toEqual(["welcome"]);
  });

  it("markDone stamps startedAt exactly once", async () => {
    const { markDone, getProgress } = await import("./progress");
    markDone("welcome");
    const first = getProgress().startedAt;
    expect(first).toBeTypeOf("string");
    markDone("capabilities");
    expect(getProgress().startedAt).toBe(first);
  });

  it("markUndone removes an id and no-ops when absent", async () => {
    const { markDone, markUndone, getDone } = await import("./progress");
    markDone("welcome");
    markDone("capabilities");
    markUndone("welcome");
    expect(getDone()).toEqual(["capabilities"]);
    expect(() => markUndone("not-there")).not.toThrow();
    expect(getDone()).toEqual(["capabilities"]);
  });

  it("isDone reflects stored state", async () => {
    const { markDone, isDone } = await import("./progress");
    expect(isDone("welcome")).toBe(false);
    markDone("welcome");
    expect(isDone("welcome")).toBe(true);
  });

  it("setLastVisited / getLastVisited round-trip", async () => {
    const { setLastVisited, getLastVisited } = await import("./progress");
    expect(getLastVisited()).toBeUndefined();
    setLastVisited("chat-first");
    expect(getLastVisited()).toBe("chat-first");
  });

  it("reset clears stored progress", async () => {
    const { markDone, reset, getDone } = await import("./progress");
    markDone("welcome");
    reset();
    expect(getDone()).toEqual([]);
  });
});
