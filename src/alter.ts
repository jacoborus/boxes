import type {
  Basic,
  Boxed,
  BoxedList,
  Dict,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
} from "./common_types.ts";
import { batch } from "./reactive.ts";

import {
  addToTriggerStack,
  getHandlers,
  getHandlersMap,
  listenersMap,
  ping,
} from "./reactive.ts";

const originUpdates = new Map<Boxed<Basic>, (value: Basic) => PropertyKey[]>();

export function setOriginUpdate(
  proxy: Boxed<Basic>,
  fn: (value: Basic) => PropertyKey[],
) {
  originUpdates.set(proxy, fn);
}

export function $update<T extends Basic>(
  pMap: ProxyMap,
  proxy: Boxed<T>,
  payload: T,
) {
  if (proxy === payload) return;
  const newTarget = copyBasic(payload, pMap);
  const updatedKeys = originUpdates.get(proxy)!(newTarget);
  batch(() => {
    stackListeners(proxy, updatedKeys);
  });
}

export function $merge(
  proxyMap: ProxyMap,
  proxy: Boxed<Basic>,
  payload: Nullable<Basic>,
) {
  const target = proxyMap.get(proxy)!;

  batch(() => {
    const updatedKeys: PropertyKey[] = [];

    for (const key in payload) {
      const value = payload[key];
      if (value === undefined) continue;
      const targetValue = target[key];
      if (value === targetValue) continue;
      if (value === null) {
        if (target[key] === undefined) continue;
        // the cases from here add the key to the updatedKeys array
        delete target[key];
      } else if (isObject(value) && isObject(targetValue)) {
        $merge(proxyMap, targetValue, value);
      } else {
        target[key] = copyItem(value, proxyMap);
      }

      updatedKeys.push(key);
    }

    stackListeners(proxy, updatedKeys);
  });
}

export function $insert<T extends List>(
  proxyMap: ProxyMap,
  proxy: Boxed<T>,
  payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
  position = proxy.length,
): void {
  const target = proxyMap.get(proxy)!;
  if (!Array.isArray(target)) {
    throw new Error("Method only allowed on lists");
  }
  if (isNaN(position)) throw new Error("Position must be a number");

  if (position === proxy.length) {
    if (Array.isArray(payload)) target.push(...payload);
    else target.push(payload);
  } else if (Array.isArray(payload)) {
    target.splice(position, 0, ...payload);
  } else {
    target.splice(position, 0, payload);
  }
  triggerListFrom(proxy, position);
}

export function $remove<T extends List>(
  proxyMap: ProxyMap,
  proxy: Boxed<T>,
  first = proxy.length - 1,
  amount = 1,
) {
  const target = proxyMap.get(proxy);
  if (!target || !Array.isArray(target)) {
    throw new Error("Method only allowed on lists");
  }
  if (isNaN(first)) throw new Error("First must be a number");
  if (isNaN(amount) || amount < 0) {
    throw new Error("Amount must be a positive number");
  }

  if (first < 0) first = target.length + first;
  const result = target.splice(first, amount);
  triggerListFrom(proxy, first);
  return result;
}

export function createBox<T extends Basic>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const mirror = inbox(source, proxyMap);

  function box(payload?: T, ismerge = false) {
    if (payload !== undefined) {
      if (ismerge) $merge(proxyMap, mirror, payload);
      else $update(proxyMap, mirror, payload);
    }
    return mirror;
  }

  box.update = function updateBox(payload: T): void {
    $update(proxyMap, mirror, payload);
  };

  box.merge = function mergeBox(payload: Nullable<Basic>): void {
    $merge(proxyMap, mirror, payload);
  };

  box.insert = function <T extends List>(
    payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
    position = mirror.length,
  ): void {
    $insert(proxyMap, mirror as BoxedList<List>, payload, position as number);
  };

  box.remove = function (
    first?: number,
    amount?: number,
  ) {
    return $remove(proxyMap, mirror as BoxedList<List>, first, amount);
  };

  return box;
}

function stackListeners(
  proxy: Boxed<Basic>,
  updatedKeys: PropertyKey[],
) {
  const keys = getHandlersMap(proxy).keys();
  let nextKey = keys.next();
  while (!nextKey.done) {
    const key = nextKey.value;
    if (updatedKeys.includes(key)) {
      addToTriggerStack(getHandlers(proxy, nextKey.value as number));
    }
    nextKey = keys.next();
  }
}

function triggerListFrom(proxy: BoxedList<List>, first: number) {
  const keys = getHandlersMap(proxy).keys();
  batch(() => {
    let nextKey = keys.next();
    while (!nextKey.done) {
      const key = nextKey.value;
      if (key as number >= first) {
        addToTriggerStack(getHandlers(proxy, key as number));
      }
      nextKey = keys.next();
    }
  });
}

function inbox<T extends Basic>(
  input: T,
  proxyMap: ProxyMap,
): Boxed<T> {
  const origin = copyBasic(input, proxyMap);

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
  }) as Boxed<T>;

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

export function copyBasic<T extends Basic>(origin: T, proxyMap: ProxyMap): T {
  return Array.isArray(origin)
    ? copyList(origin, proxyMap)
    : copyDict(origin, proxyMap) as T;
}

export function copyItem<T>(item: T, proxyMap: ProxyMap) {
  return !isObject(item) || isBoxed(item) ? item : inbox(item, proxyMap);
}

function copyDict<T extends Dict>(origin: T, proxyMap: ProxyMap): T {
  const result: T = {} as T;
  for (const i in origin) {
    const item = origin[i];
    if (item === undefined || item === null) continue;
    result[i as keyof T] = copyItem(item, proxyMap);
  }
  return result;
}

function copyList<T extends List>(origin: T, proxyMap: ProxyMap): T {
  const result: T = [] as unknown as T;
  for (const item of origin) {
    result.push(copyItem(item, proxyMap));
  }
  return result;
}

function isBoxed(
  value: unknown,
): value is Boxed<Basic> {
  return listenersMap.has(value as Boxed<Basic>);
}

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}
