import type {
  Basic,
  Dict,
  Fn1,
  GetThing,
  List,
  ListenersMap,
  NonObjectNull,
  NonReadonlyList,
  Nullable,
  ProxyMap,
  ReadonlyBasic,
  ReadonlyList,
  SetThing,
} from "./common_types.ts";

const SELF = Symbol("self");

const listenersMap: ListenersMap = new WeakMap();
const originMap: WeakMap<Basic, ReadonlyBasic<Basic>> = new WeakMap();
let listenersStack: Map<
  ReadonlyBasic<Basic> | GetThing<unknown>,
  Set<PropertyKey>
> = new Map();

let isTracking = false;

function getHandlers<T extends ReadonlyBasic<Basic> | GetThing<unknown>>(
  target: T,
  property?: keyof T,
) {
  const handlersMap = listenersMap.get(target);
  if (!handlersMap) {
    throw new Error("Can't subscribe to non box");
  }
  const key = property || SELF;
  return handlersMap.get(key) || handlersMap.set(key, new Set<Fn1>())
    .get(key)!;
}

export function watch<T>(
  target: T,
  callback: (value: T) => void,
) {
  const handlers = getHandlers(
    target as ReadonlyBasic<Basic> | GetThing<T>,
  );
  const handler = () => callback(target);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function ping<T extends Basic>(
  value: ReadonlyBasic<T> | GetThing<unknown>,
  prop?: keyof T,
) {
  if (!isTracking) return;
  const stack = listenersStack.get(value) ||
    listenersStack.set(value, new Set()).get(value)!;
  stack.add(prop || SELF);
}

function stopTracking() {
  isTracking = false;
  const stack = listenersStack;
  listenersStack = new Map();
  return stack;
}

export function watchFn<T>(
  getter: () => T,
  callback: (value: T) => void,
) {
  isTracking = true;
  const computed = { value: getter() };
  const stack = stopTracking();
  const offStack: (() => void)[] = [];
  stack.forEach((_, propkey) => {
    offStack.push(watch(propkey, () => {
      const newValue = getter();
      if (newValue === computed.value) return;
      callback(newValue as T);
    }));
  });
  return () => offStack.forEach((fn) => fn());
}

export function createThingy<T>(
  input: NonObjectNull<T>,
): [GetThing<T>, SetThing<T>] {
  if (!isPrimitive(input)) throw new Error("Can't box non-primitive");
  let origin = input;
  const getThing = () => {
    ping(getThing);
    return origin;
  };
  listenersMap.set(getThing, new Map());

  return [
    getThing,
    (value: NonObjectNull<T>) => {
      if (origin === value) return;
      if (!isPrimitive(value)) throw new Error("Can't box non-primitive");
      origin = value;
      listenersMap.get(getThing)?.get(SELF)?.forEach((listener) =>
        listener(origin)
      );
    },
  ];
}

export function createBox<T extends Basic>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const mirror = inbox(source, proxyMap)[1];

  function alter<T extends List, R>(
    proxy: ReadonlyList<T>,
    change: (target: T) => R,
  ) {
    const target = proxyMap.get(
      proxy as unknown as ReadonlyBasic<Basic>,
    );
    if (!target || !Array.isArray(target)) {
      throw new Error("Method only allowed on lists");
    }
    const result = change(target as T);
    const handlers = getHandlers(proxy);
    handlers.forEach((handler) => handler(target));
    return result;
  }

  function box() {
    return mirror;
  }

  box.update = function <T extends Basic>(proxy: ReadonlyBasic<T>, payload: T) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (isDict(target)) {
      if (Array.isArray(payload)) throw new Error("not gonna happen");
      for (const key in payload) {
        const value = payload[key as keyof typeof payload];
        target[key] = copyItem(value, proxyMap);
      }
    } else {
      if (!Array.isArray(payload)) throw new Error("not gonna happen");
      payload.forEach((value, i) => {
        target[i] = value;
      });
      target.length = payload.length;
    }
    const handlers = getHandlers(proxy);
    handlers.forEach((listener) => listener(target));
  };

  box.patch = function (proxy: ReadonlyBasic<Basic>, payload: Nullable<Basic>) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (Array.isArray(payload) || Array.isArray(target)) {
      throw new Error("Method only allowed on lists");
    }
    const propsToCall: PropertyKey[] = [];
    for (const key in payload) {
      const value = payload[key];
      if (value === undefined) continue;
      if (value === null) {
        if (target[key] === undefined) continue;
        delete target[key];
        propsToCall.push(key);
      } else {
        target[key] = copyItem(value, proxyMap);
        propsToCall.push(key);
      }
    }
    const handlers = getHandlers(proxy);
    handlers?.forEach((handler) => handler(proxy));
  };

  box.insert = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    position: number,
    ...payload: NonReadonlyList<T[number]>[]
  ): void {
    return alter(
      proxy,
      (target) => {
        if (isNaN(position)) throw new Error("Position must be a number");
        target.splice(position, 0, ...payload);
      },
    );
  };

  box.extract = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    first = proxy.length,
    amount = 1,
  ): T[number][] {
    return alter(
      proxy,
      (target) => {
        if (isNaN(first) || isNaN(amount)) {
          throw new Error("First and amount must be a number");
        }
        // TODO: return a readonly copy of the extracted items
        return target.splice(first, amount);
      },
    );
  };

  return box;
}

function inbox<T extends Basic>(
  input: T,
  proxyMap: ProxyMap,
): [T, ReadonlyBasic<T>] {
  const origin = Array.isArray(input)
    ? copyList(input, proxyMap)
    : copyDict(input, proxyMap);

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a readonly object");
    },

    deleteProperty: () => {
      throw new Error("Cannot modify a readonly object");
    },

    get: (origin, property, mirror) => {
      if (Object.prototype.hasOwnProperty.call(origin, property)) {
        ping(mirror, property as keyof T);
      }
      const value = origin[property as keyof typeof origin];
      if (!isObject(value) || isBoxed(value)) return value;
      return originMap.get(value);
    },
  }) as ReadonlyBasic<T>;

  proxyMap.set(proxy, origin);
  originMap.set(origin, proxy);
  listenersMap.set(proxy, new Map());

  return [origin as T, proxy];
}

function copyItem<T>(item: T, proxyMap: ProxyMap) {
  return !isObject(item)
    ? item
    : isBoxed(item)
    ? proxyMap.get(item) as typeof item
    : inbox(item, proxyMap)[0];
}

function copyDict<T extends Dict>(origin: T, proxyMap: ProxyMap): T {
  const result = {} as T;
  for (const i in origin) {
    const item = origin[i];
    if (item === undefined || item === null) continue;
    result[i as keyof T] = copyItem(item, proxyMap);
  }
  return result as T;
}

function copyList<T extends List>(origin: T, proxyMap: ProxyMap): T {
  const result = [] as unknown as T;
  for (const item of origin) {
    result.push(copyItem(item, proxyMap));
  }
  return result;
}

function isPrimitive<T>(x: unknown): x is NonObjectNull<T> {
  return !(x instanceof Object) || x !== null;
}

export function isBoxed(
  value: unknown,
): value is ReadonlyBasic<Basic> {
  return listenersMap.has(value as ReadonlyBasic<Basic>);
}

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isDict(value: unknown): value is Dict {
  return isObject(value) && !Array.isArray(value);
}
