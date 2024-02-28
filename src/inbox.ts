import type { Basic, Boxed, ProxyMap } from "./common_types.ts";

import { listenersMap, ping } from "./reactive.ts";
import { copyBasic, createOriginUpdate } from "./alter.ts";

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
