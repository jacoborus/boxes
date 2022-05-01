type Basic = Record<string, unknown>;
type ProxyMap = Map<Basic, Set<Handler<Basic>>>;
type Handler<T> = (target: T) => void;

const origins = new WeakMap<Basic, Basic>();
const proxies = new WeakMap<Basic, Basic>();
const handlers = new WeakMap<Basic, Set<Handler<Basic>>>() as ProxyMap;
const watchers = new Set<Set<Basic>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object";
}

export function getBox<T>(origin: T): T {
  if (proxies.has(origin as Basic)) {
    return proxies.get(origin as Basic) as T;
  }
  if (origins.has(origin as Basic)) return origin as T;
  const currentHandlers = new Set<Handler<Basic>>();
  const box = new Proxy(origin as Record<string, unknown>, {
    get: (o, prop) => {
      if (watchers.size) {
        watchers.forEach((arr) => arr.add(box));
      }
      const value = (o as T)[prop as keyof typeof origin];
      if (!isRecord(value)) return value;
      if (proxies.has(value as Basic)) {
        return proxies.get(value as Basic);
      }
      return getBox<typeof value>(value);
    },
    set: (_, prop, value, receiver) => {
      if (isRecord(value)) {
        (origin as typeof receiver)[prop as keyof typeof origin] = getBox(
          value,
        );
      } else {
        (origin as typeof receiver)[prop as keyof typeof origin] = value;
      }
      currentHandlers?.forEach((handler) => {
        handler(box);
      });
      return true;
    },
    deleteProperty: () => false,
  });
  proxies.set(origin as Basic, box as Basic);
  origins.set(box as Basic, origin as Basic);
  handlers.set(box, currentHandlers);
  return box as T;
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

export function computed<C>(fn: () => C): {
  value: C;
  on: (fn: Handler<C>) => void;
  off: (fn: Handler<C>) => void;
} {
  const targets = new Set<Basic>();
  watchers.add(targets);
  const externalWatchers = new Set<Handler<C>>();
  const value = {
    value: fn(),
    on: (fn: Handler<C>) => {
      externalWatchers.add(fn);
    },
    off: (fn: Handler<C>) => {
      externalWatchers.delete(fn);
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
