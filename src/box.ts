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
import { getHandlersKeys } from "./reactive.ts";
// import { batch } from "./reactive.ts";
import {
  addToTriggerStack,
  closeTriggerStack,
  openTriggerStack,
} from "./reactive.ts";

import { getHandlers, listenersMap, ping } from "./reactive.ts";

const proxyMap: ProxyMap = new WeakMap();
const originUpdates = new Map<ReadonlyBasic<Basic>, (value: Basic) => void>();

export function createBox<T extends Basic>(source: T) {
  const mirror = inbox(source)[1];

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
    change(target as T);
    const handlers = getHandlers(proxy);
    handlers.forEach((handler) => handler());
  }

  function box() {
    return mirror;
  }

  box.update = function <T extends Basic>(proxy: ReadonlyBasic<T>, payload: T) {
    const stackKey = openTriggerStack();
    const updater = originUpdates.get(proxy)!;
    if (proxy === payload) return;
    const target = proxyMap.get(proxy) as T;
    const newTarget = inbox(payload)[0];
    updater(newTarget);
    const handlerKeys = getHandlersKeys(proxy);
    const propsToCall = new Set<PropertyKey>();

    for (const key in handlerKeys) {
      if (target[key as keyof T] !== newTarget[key as keyof T]) {
        propsToCall.add(key);
      }
    }

    propsToCall.forEach((prop) => {
      const handlers = getHandlers(proxy, prop as number);
      handlers?.forEach((handler) => addToTriggerStack(handler));
    });
    closeTriggerStack(stackKey);
  };

  box.patch = function (proxy: ReadonlyBasic<Basic>, payload: Nullable<Basic>) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    const propsToCall: PropertyKey[] = [];
    const stackKey = openTriggerStack();
    for (const key in payload) {
      const value = payload[key];
      const targetValue = target[key];
      if (value === targetValue || value === undefined) continue;
      if (value === null) {
        if (target[key] === undefined) continue;
        delete target[key];
      } else if (isObject(value) && isObject(targetValue)) {
        box.patch(targetValue, copyItem(value) as Nullable<Basic>);
      } else {
        target[key] = copyItem(value);
      }
      propsToCall.push(key);
    }

    propsToCall.forEach((prop) => {
      const handlers = getHandlers(proxy, prop as number);
      handlers?.forEach((handler) => addToTriggerStack(handler));
    });

    closeTriggerStack(stackKey);
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
): [T, ReadonlyBasic<T>] {
  let origin = Array.isArray(input) ? copyList(input) : copyDict(input);

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
  originUpdates.set(proxy, (value) => {
    origin = value as T;
  });

  return [origin as T, proxy];
}

function copyItem<T>(item: T) {
  return !isObject(item) || isBoxed(item) ? item : inbox(item)[1];
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

function isDict(value: unknown): value is Dict {
  return isObject(value) && !Array.isArray(value);
}
