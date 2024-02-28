import type {
  Basic,
  BoxedList,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
} from "./common_types.ts";

import { $insert, $merge, $remove, $update } from "./alter.ts";
import { inbox } from "./inbox.ts";

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
