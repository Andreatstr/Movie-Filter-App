type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | {[key: string]: JSONValue};

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (isBrowser) return window.localStorage.getItem(key);
  } catch {
    // ignore
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (isBrowser) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // ignore
  }
  memoryStore.set(key, value);
  return false;
}

function safeRemoveItem(key: string): void {
  try {
    if (isBrowser) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  memoryStore.delete(key);
}

export const storage = {
  get<T = JSONValue>(key: string, fallback: T): T {
    try {
      const raw = safeGetItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T = JSONValue>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return safeSetItem(key, serialized);
    } catch {
      return safeSetItem(key, '');
    }
  },
  remove(key: string) {
    safeRemoveItem(key);
  },
};

export const __TEST_ONLY__ = {
  memoryStore,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
};
