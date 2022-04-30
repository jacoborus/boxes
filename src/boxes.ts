type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

type Basic = Record<string, unknown>;
type ProxyMap = Map<Basic, Set<Handler<Basic>>>;
type Handler<T> = (target: T) => void;

const origins = new Map();
const proxies = new Map();
const handlers = new WeakMap<Basic, Set<Handler<Basic>>>() as ProxyMap;

const watchers = new Set<Set<Basic>>();

export function getBox<T>(origin: T | Immutable<T>): Immutable<T> {
  if (proxies.has(origin)) return proxies.get(origin);
  if (origins.has(origin)) return origin;
  const proxy = new Proxy(origin as Record<string, unknown>, {
    get: (o, prop) => {
      if (watchers.size) {
        watchers.forEach((arr) => arr.add(proxy));
      }
      const value = (o as T)[prop as keyof typeof origin];
      if (typeof value !== "object") return value;
      if (proxies.has(value)) {
        return proxies.get(value);
      }
      return getBox<typeof value>(value);
    },
    set: () => false,
    deleteProperty: () => false,
  });
  proxies.set(origin, proxy);
  origins.set(proxy, origin);
  handlers.set(proxy, new Set<Handler<Basic>>());
  return proxy as Immutable<T>;
}

export function on<O extends Basic>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy)) return;
  // if (!origins.has(proxy)) throw new Error("wrong target");
  const handlersSet = handlers.get(proxy as Basic) as Set<Handler<Basic>>;
  handlersSet.add(handler as Handler<Basic>);
}

export function assign<T extends Basic>(proxy: T, obj: Partial<T>) {
  if (!handlers.has(proxy)) {
    Object.assign(proxy, obj);
    return;
  }
  const realTarget = origins.get(proxy);
  for (const i in obj) {
    const value = obj[i];
    if (typeof value === "object") {
      realTarget[i] = getBox(value);
    } else {
      realTarget[i] = value;
    }
  }
  const currentHandlers = handlers.get(proxy);
  currentHandlers?.forEach((handler) => {
    handler(proxy);
  });
}

export function computed<C>(fn: () => C): {
  value: C;
  on: (fn: Handler<C>) => void;
} {
  const targets = new Set<Basic>();
  watchers.add(targets);
  const externalWatchers = new Set<Handler<C>>();
  const value = {
    value: fn(),
    on: (fn: Handler<C>) => {
      externalWatchers.add(fn);
    },
  };
  watchers.delete(targets);
  targets.forEach((target) => {
    on(target, () => {
      value.value = fn();
      externalWatchers.forEach((handler) => {
        handler(value.value);
      });
    });
  });
  return value;
}
