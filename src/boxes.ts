type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

type Basic = Record<string, unknown>;
type ProxyMap = Map<Basic, Set<Handler<Basic>>>;
type Handler<T> = (target: T) => void;

const origins = new WeakMap<Immutable<Basic>, Basic>();
const proxies = new WeakMap<Basic, Immutable<Basic>>();
const handlers = new WeakMap<Basic, Set<Handler<Basic>>>() as ProxyMap;

const watchers = new Set<Set<Basic>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object";
}
export function getBox<T>(origin: T | Immutable<T>): Immutable<T> {
  if (proxies.has(origin as Basic)) {
    return proxies.get(origin as Basic) as Immutable<T>;
  }
  if (origins.has(origin as Immutable<Basic>)) return origin as Immutable<T>;
  const proxy = new Proxy(origin as Record<string, unknown>, {
    get: (o, prop) => {
      if (watchers.size) {
        watchers.forEach((arr) => arr.add(proxy));
      }
      const value = (o as T)[prop as keyof typeof origin];
      if (!isRecord(value)) return value;
      if (proxies.has(value as Basic)) {
        return proxies.get(value as Basic);
      }
      return getBox<typeof value>(value);
    },
    set: () => false,
    deleteProperty: () => false,
  });
  proxies.set(origin as Basic, proxy as Immutable<Basic>);
  origins.set(proxy as Immutable<Basic>, origin as Basic);
  handlers.set(proxy, new Set<Handler<Basic>>());
  return proxy as Immutable<T>;
}

export function on<O extends Basic>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy)) return;
  // if (!origins.has(proxy)) throw new Error("wrong target");
  const handlersSet = handlers.get(proxy as Basic) as Set<Handler<Basic>>;
  handlersSet.add(handler as Handler<Basic>);
}

export function off<O extends Basic>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy)) return;
  // if (!origins.has(proxy)) throw new Error("wrong target");
  const handlersSet = handlers.get(proxy as Basic) as Set<Handler<Basic>>;
  handlersSet.delete(handler as Handler<Basic>);
}

export function assign<T extends Basic>(proxy: T, obj: Partial<T>) {
  if (!handlers.has(proxy)) {
    Object.assign(proxy, obj);
    return;
  }
  const realTarget = origins.get(proxy as Immutable<Basic>) as Basic;
  for (const i in obj) {
    const value = obj[i];
    if (isRecord(value)) {
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
