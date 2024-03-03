import type { Basic, Boxed, Dict, List, ProxyMap } from "./common_types.ts";

import { isBoxed, listenersMap, ping } from "./reactivity.ts";
import { createOriginUpdate } from "./alter.ts";

export function inbox<T extends Basic>(
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

  createOriginUpdate(proxy, origin);

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

export function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}
