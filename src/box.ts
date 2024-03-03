import type {
  Basic,
  Boxed,
  BoxedList,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
} from "./common_types.ts";

import { $insert, $merge, $remove, $set, $update } from "./alter.ts";
import { inbox } from "./inbox.ts";

export function createBox<T extends Basic>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const mirror = inbox(source, proxyMap);

  function box(): Boxed<T>;
  function box(
    proxy: Boxed<T>,
    key: keyof T,
    value: Nullable<T>,
  ): void;
  function box(
    proxy?: Boxed<T>,
    key?: keyof T,
    value?: Nullable<T>,
  ) {
    if (proxy === undefined) {
      return mirror;
    }
    $set(proxy, key!, value!, proxyMap);
  }

  box.update = function updateBox(payload: T): void {
    $update(mirror, payload, proxyMap);
  };

  box.merge = function mergeBox(payload: Nullable<Basic>): void {
    $merge(mirror, payload, proxyMap);
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
