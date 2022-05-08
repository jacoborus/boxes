type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};
type Basic = Record<string, unknown>;

const KEY = Symbol();
type Handler<T> = (target: T, prop: keyof T | typeof KEY) => void;
type HandlerSet<T> = Set<Handler<T>>;
type HandlerMap<T> = Map<string | typeof KEY, HandlerSet<T>>;

const origins = new WeakMap<Basic, Basic>();
const proxies = new WeakMap<Basic, Basic>();
const handlers = new WeakMap<
  Basic,
  Map<string | typeof KEY, Set<Handler<Basic>>>
>();
const watchers = new Set<Set<Basic>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object";
}

export function getBox<T>(origin: T): T {
  if (proxies.has(origin as Basic)) {
    return proxies.get(origin as Basic) as T;
  }
  if (origins.has(origin as Basic)) return origin as T;
  const currentHandlerMap = new Map() as HandlerMap<Basic>;
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
      // TODO: remove object bindings and just depend on the prop ones?
      // trigger object bindings
      if (currentHandlerMap.has(KEY)) {
        const handlerSet = currentHandlerMap.get(KEY) as HandlerSet<Basic>;
        handlerSet.forEach((handler) => {
          handler(box, prop as string);
        });
      }
      // trigger prop bindings
      if (currentHandlerMap.has(prop as string)) {
        const propHandlerSet = currentHandlerMap.get(
          prop as string,
        ) as HandlerSet<Basic>;
        propHandlerSet.forEach((handler) => {
          handler(box, prop as string);
        });
      }
      return true;
    },
    deleteProperty: () => false,
  });
  proxies.set(origin as Basic, box as Basic);
  origins.set(box as Basic, origin as Basic);
  handlers.set(box, currentHandlerMap as HandlerMap<Basic>);
  return box as T;
}

export function watch<O>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy as Basic)) return;
  const handlerMap = handlers.get(proxy as Basic) as HandlerMap<Basic>;
  let theSet = handlerMap.get(KEY);
  if (!theSet) {
    const newSet = new Set<Handler<Basic>>();
    handlerMap.set(KEY, newSet);
    theSet = newSet;
  }
  // TODO why unknown here?
  theSet.add(handler as unknown as Handler<Basic>);
  return () => {
    // TODO why unknown here?
    (theSet as HandlerSet<Basic>).delete(handler as unknown as Handler<Basic>);
  };
}

export function unwatch<O extends Basic>(proxy: O, handler: Handler<O>) {
  if (!handlers.has(proxy)) return;
  const handlerMap = handlers.get(proxy) as HandlerMap<O>;
  const theSet = handlerMap.get(KEY);
  if (theSet) theSet.delete(handler);
}

export function watchEffect(fn: () => void): () => void {
  const targets = new Set<Basic>();
  watchers.add(targets);
  fn();
  watchers.delete(targets);
  const reFn = () => {
    fn();
  };
  targets.forEach((target) => {
    watch(target, reFn);
  });
  return () => {
    targets.forEach((target) => {
      unwatch(target, reFn);
    });
  };
}

export function watchFn<T>(
  fn: () => T,
  handler: (value: T) => unknown,
): () => void {
  const targets = new Set<Basic>();
  watchers.add(targets);
  const reFn = () => handler(fn());
  fn();
  watchers.delete(targets);
  targets.forEach((target) => {
    watch(target, reFn);
  });
  return () => {
    targets.forEach((target) => {
      unwatch(target, reFn);
    });
  };
}

export function watchProp<O>(
  proxy: O,
  prop: keyof O,
  handler: Handler<O>,
): () => void {
  if (!handlers.has(proxy as Basic)) throw new Error("wrong target to watch");
  const handlerMap = handlers.get(proxy as Basic) as HandlerMap<Basic>;
  const p = typeof prop === "string" ? prop : prop.toString();
  let theSet = handlerMap.get(p);
  if (!theSet) {
    const newSet = new Set<Handler<Basic>>();
    handlerMap.set(p, newSet);
    theSet = newSet;
  }
  // TODO why uhnknown here?
  theSet.add(handler as unknown as Handler<Basic>);
  return () => {
    (theSet as HandlerSet<Basic>).delete(handler as unknown as Handler<Basic>);
  };
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
  const currentHandlers = new Map() as HandlerMap<Basic>;
  handlers.set(proxy, currentHandlers);
  targets.forEach((target) => {
    watch(target, () => {
      compu.value = fn();
      const handlerMap = handlers.get(proxy);
      if (!handlerMap) return;
      const handlerSet = handlerMap.get(KEY);
      if (!handlerSet) return;
      handlerSet.forEach((handler) => {
        handler(compu, KEY);
      });
    });
  });
  return proxy;
}

// export function watchDot<T extends Basic>(
//   box: T,
//   prop: keyof T,
//   handler: Handler<T[typeof prop]>,
// ): () => void {
//   if (!origins.has(box)) throw new Error("box is not a box");
//   if (!(prop as string).includes(".")) {
//     const handlerMap = handlers.get(box) as HandlerMap<T>;
//     const handlerSet = handlerMap.get(prop as string);
//     if (handlerSet) handlerSet.forEach((handler) => handler(box));
//   }
//   const props = (prop as string).split(".");
//   let len = props.length - 1;
//   const propName = props[len];
//   const scopes = [box] as Basic[];
//   props.forEach((propName) => {
//     const localBox = scopes[scopes.length - 1][propName] || {};
//     scopes.push(localBox as Basic);
//   });
//   const controllers: Basic[] = [];
//   const finalEventController = ee.on(scopes[len], propName, handler);
//   controllers.unshift(finalEventController);
//   while (--len >= 0) {
//     const localProp = props[len];
//     const localScope = scopes[len];
//     const n = len + 1;
//     const eventController = ee.on(
//       localScope,
//       localProp,
//       (_, __, ___, oldValue, newValue) => {
//         const nextController = controllers[n];
//         const currentProp = props[n];
//         const nextScope = typeof newValue === "object" ? newValue : {};
//         const prevScope = oldValue && typeof oldValue === "object"
//           ? oldValue
//           : {};
//         const nextValue = nextScope[currentProp];
//         const prevValue = prevScope[currentProp];
//         nextScope.__isWatched = true;
//         nextController.transfer(nextScope);
//         nextValue !== prevValue &&
//           nextController.emit(
//             nextScope,
//             currentProp,
//             "set",
//             prevValue,
//             nextValue,
//           );
//       },
//     );
//     controllers.unshift(eventController);
//   }
//   return {
//     emit: handler,
//     off() {
//       controllers.forEach((controller) => controller.off());
//     },
//   };
// }
