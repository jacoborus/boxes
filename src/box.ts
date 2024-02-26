import type {
  Basic,
  Boxed,
  BoxedList,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
} from "./common_types.ts";

import { listenersMap, ping } from "./reactive.ts";
import {
  $insert,
  $merge,
  $remove,
  $update,
  copyBasic,
  setOriginUpdate,
} from "./alter.ts";

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

  setOriginUpdate(proxy, (input) => {
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
