/**
 * Progress persistence — all client-side, no network.
 * Replayable: a "Reset" call clears the slate.
 * Resumable: returning learners see what they've already done.
 */

const KEY = "claude-tutorial.progress.v1";

interface Progress {
  done: string[];
  lastVisited?: string;
  startedAt?: string;
}

function read(): Progress {
  if (typeof localStorage === "undefined") return { done: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { done: [] };
    const parsed = JSON.parse(raw) as Progress;
    if (!Array.isArray(parsed.done)) return { done: [] };
    return parsed;
  } catch {
    return { done: [] };
  }
}

function write(next: Progress): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ct:progress", { detail: next }));
}

export function getDone(): string[] {
  return read().done;
}

export function isDone(id: string): boolean {
  return read().done.includes(id);
}

export function markDone(id: string): void {
  const cur = read();
  if (cur.done.includes(id)) return;
  write({
    ...cur,
    done: [...cur.done, id],
    startedAt: cur.startedAt ?? new Date().toISOString(),
  });
}

export function markUndone(id: string): void {
  const cur = read();
  if (!cur.done.includes(id)) return;
  write({ ...cur, done: cur.done.filter((x) => x !== id) });
}

export function setLastVisited(id: string): void {
  const cur = read();
  write({ ...cur, lastVisited: id });
}

export function getLastVisited(): string | undefined {
  return read().lastVisited;
}

export function reset(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("ct:progress", { detail: { done: [] } }));
}

export type { Progress };
