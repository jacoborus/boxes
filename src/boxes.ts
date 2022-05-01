type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

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

export function on<O>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy as Basic)) return;
  const handlersSet = handlers.get(proxy as Basic) as Set<Handler<Basic>>;
  handlersSet.add(handler as Handler<Basic>);
}

export function off<O extends Basic>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy)) return;
  const handlersSet = handlers.get(proxy as Basic) as Set<Handler<Basic>>;
  handlersSet.delete(handler as Handler<Basic>);
}

export function watchEffect(fn: () => void) {
  const targets = new Set<Basic>();
  watchers.add(targets);
  fn();
  watchers.delete(targets);
  targets.forEach((target) => {
    on(target, () => {
      fn();
    });
  });
}

export function computed<C>(fn: () => C): Immutable<{
  value: C;
}> {
  const targets = new Set<Basic>();
  watchers.add(targets);
  const compu = {
    value: fn(),
  };
  const proxy = new Proxy(compu, {
    get: () => compu.value,
    set: () => false,
    deleteProperty: () => false,
  });
  watchers.delete(targets);
  const currentHandlers = new Set<Handler<Basic>>();
  handlers.set(proxy, currentHandlers);
  targets.forEach((target) => {
    on(target, () => {
      compu.value = fn();
      const handlerSet = handlers.get(proxy);
      if (!handlerSet) return;
      handlerSet.forEach((handler) => {
        handler(compu);
      });
    });
  });
  return proxy;
}
