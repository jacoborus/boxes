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
import { inbox } from "./inbox.ts";

import {
  addToTriggerStack,
  batch,
  getHandlers,
  getHandlersMap,
  listenersMap,
} from "./reactive.ts";

/**
 * A weakmap to store the functions that update the origino associated to a box
 */
const originUpdates = new WeakMap<
  Boxed<Basic>,
  (value: Basic) => PropertyKey[]
>();

/**
 * Creates an update function for a given proxy and its associated origin value.
 * @param proxy The boxed proxy value.
 * @param origin The original value associated to the proxy
 */
export function createOriginUpdate<T extends Basic>(
  proxy: Boxed<T>,
  origin: T,
) {
  originUpdates.set(proxy, (input: Basic) => {
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
}

/**
 * Updates the contents of a box/collection with a new set of values,
 * @param pMap The map of proxies.
 * @param proxy The proxy value to be updated.
 * @param payload The new value.
 */
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

/**
 * Sets a value in a box/collection at a given key
 * @param proxyMap The map of proxies.
 * @param proxy The proxy value.
 * @param key The key where the value is to be set.
 * @param value The value to set.
 */
export function $set<T extends Basic>(
  proxyMap: ProxyMap,
  proxy: Boxed<T>,
  key: keyof T,
  value: Nullable<T>,
) {
  const context = proxyMap.get(proxy)!;
  const target = context[key as number];
  if (target === value) return;
  if (value === null) delete context[key as number];
  if (isBoxed(value)) {
    context[key as number] = value;
  } else {
    context[key as number] = copyItem(value, proxyMap);
  }
  stackListeners(proxy, [key]);
}

/**
 * Merges a payload deeply into a box/collection
 * @param proxyMap The map of proxies.
 * @param proxy The proxy value.
 * @param payload The value to merge.
 */
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

/**
 * Inserts one or more values into a boxed list at a specified position
 * @param proxyMap The map of proxies.
 * @param proxy The proxy value.
 * @param payload The value(s) to insert.
 * @param position The position to insert at. Defaults to the end of the list.
 */
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

/**
 * Removes items from a boxed list
 * @param proxyMap The map of proxies.
 * @param proxy The proxy value.
 * @param first The index to start removing items from. Defaults to the end of the list.
 * @param amount The number of items to remove. Defaults to 1.
 * @returns The removed items.
 */
export function $remove<T extends List>(
  proxyMap: ProxyMap,
  proxy: BoxedList<T>,
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

/**
 * Iterates through the handlers for a proxy, stacking them if their corresponding keys were updated.
 * @param proxy The proxy value.
 * @param updatedKeys The keys that were updated.
 */
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

/**
 * Triggers listeners for a boxed list from a given index onwards.
 * @param proxy The list proxy value.
 * @param first The index from which to trigger listeners.
 */
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
