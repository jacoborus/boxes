import type {
  Basic,
  Dict,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
  ReadonlyBasic,
  ReadonlyList,
} from "./common_types.ts";

import {
  addToTriggerStack,
  getHandlers,
  getHandlersMap,
  listenersMap,
  lockTriggerStack,
  ping,
  unlockTriggerStack,
} from "./reactive.ts";

const proxyMap: ProxyMap = new WeakMap();
const originUpdates = new Map<
  ReadonlyBasic<Basic>,
  (value: Basic) => PropertyKey[]
>();

export function createBox<T extends Basic>(source: T) {
  const mirror = inbox(source);

  function alter<T extends List, R>(
    proxy: ReadonlyList<T>,
    change: (target: T) => R,
  ) {
    const target = proxyMap.get(proxy);
    if (!target || !Array.isArray(target)) {
      throw new Error("Method only allowed on lists");
    }
    change(target as T);
    const handlers = getHandlers(proxy);
    handlers.forEach((handler) => handler());
  }

  function box() {
    return mirror;
  }

  box.update = function <T extends Basic>(proxy: ReadonlyBasic<T>, payload: T) {
    if (proxy === payload) return;
    const target = proxyMap.get(proxy) as T;
    if (!target) throw new Error("Can't update non box");
    const newTarget = copyBasic(payload);
    const updateOrigin = originUpdates.get(proxy)!;

    const updatedKeys = updateOrigin(newTarget);
    lockTriggerStack();

    const handlerKeys = Array.from(getHandlersMap(proxy).keys());

    for (const key of handlerKeys) {
      if (updatedKeys.includes(key)) {
        getHandlers(proxy, key as number).forEach((handler) =>
          addToTriggerStack(handler)
        );
      }
    }

    unlockTriggerStack();
  };

  box.patch = function (proxy: ReadonlyBasic<Basic>, payload: Nullable<Basic>) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    const propsToCall: PropertyKey[] = [];
    lockTriggerStack();
    for (const key in payload) {
      const value = payload[key];
      const targetValue = target[key];
      if (value === targetValue || value === undefined) continue;
      if (value === null) {
        if (target[key] === undefined) continue;
        delete target[key];
      } else if (isObject(value) && isObject(targetValue)) {
        box.patch(targetValue, value);
      } else {
        target[key] = copyItem(value);
      }
      propsToCall.push(key);
    }

    propsToCall.forEach((prop) => {
      const handlers = getHandlers(proxy, prop as number);
      handlers?.forEach((handler) => addToTriggerStack(handler));
    });

    unlockTriggerStack();
  };

  box.insert = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
    position = proxy.length,
  ): void {
    return alter(proxy, (target) => {
      if (isNaN(position)) throw new Error("Position must be a number");
      if (position === proxy.length) {
        if (Array.isArray(payload)) target.push(...payload);
        else target.push(payload);
        return;
      }
      if (Array.isArray(payload)) target.splice(position, 0, ...payload);
      else target.splice(position, 0, payload);
    });
  };

  box.remove = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    first = proxy.length,
    amount = 1,
  ) {
    alter(proxy, (target) => {
      if (isNaN(first) || isNaN(amount)) {
        throw new Error("First and amount must be a number");
      }
      target.splice(first, amount);
    });
  };

  return box;
}

function inbox<T extends Basic>(
  input: T,
): ReadonlyBasic<T> {
  const origin = copyBasic(input);

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a readonly object");
    },

    deleteProperty: () => {
      throw new Error("Cannot modify a readonly object");
    },

    get: (_, property, mirror) => {
      if (Object.prototype.hasOwnProperty.call(origin, property)) {
        ping(mirror, property as keyof T);
      }
      return origin[property as keyof typeof origin];
    },
  }) as ReadonlyBasic<T>;

  proxyMap.set(proxy, origin);
  listenersMap.set(proxy, new Map());

  originUpdates.set(proxy, (input) => {
    const keys = new Set(Object.keys(input).concat(Object.keys(origin)));
    const updatedKeys: PropertyKey[] = [];
    keys.forEach((key) => {
      const newValue = input[key as unknown as number];
      if (newValue === origin[key as unknown as number]) return;
      updatedKeys.push(key);
      if (newValue === undefined || newValue === null) {
        delete origin[key as unknown as number];
        return;
      }

      origin[key as unknown as number] = input[key as unknown as number];
    });

    return updatedKeys;
  });

  return proxy;
}

function copyBasic<T extends Basic>(origin: T): T {
  return Array.isArray(origin) ? copyList(origin) : copyDict(origin) as T;
}

export function copyItem<T>(item: T) {
  return !isObject(item) || isBoxed(item) ? item : inbox(item);
}

function copyDict<T extends Dict>(origin: T): T {
  const result: T = {} as T;
  for (const i in origin) {
    const item = origin[i];
    if (item === undefined || item === null) continue;
    result[i as keyof T] = copyItem(item);
  }
  return result;
}

function copyList<T extends List>(origin: T): T {
  const result: T = [] as unknown as T;
  for (const item of origin) {
    result.push(copyItem(item));
  }
  return result;
}

export function isBoxed(
  value: unknown,
): value is ReadonlyBasic<Basic> {
  return listenersMap.has(value as ReadonlyBasic<Basic>);
}

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}
