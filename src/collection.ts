import type {
  Boxed,
  BoxedList,
  List,
  NonReadonlyList,
  Nullable,
  ProxyMap,
} from "./common_types.ts";
import { inbox } from "./inbox.ts";
import { $insert, $remove, $set } from "./alter.ts";

export function createCollection<T extends List>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const mirror = inbox(source, proxyMap) as BoxedList<T>;

  function col(
    proxy: BoxedList<T>,
    key: keyof T,
    value: Nullable<T>,
  ) {
    if (proxy === undefined) {
      return mirror;
    }
    $set(proxy as Boxed<T>, key!, value!, proxyMap);
  }

  col.insert = function <T extends List>(
    payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
    position = mirror.length,
  ): void {
    $insert(proxyMap, mirror as BoxedList<List>, payload, position as number);
  };

  col.remove = function (
    filter: (i: BoxedList<T>[keyof BoxedList<T>]) => boolean,
  ) {
    const index = mirror.findIndex(filter);
    if (index === -1) return;
    $remove(proxyMap, mirror, index, 1);
  };

  col.extract = function (first?: number, amount?: number) {
    return $remove(proxyMap, mirror, first, amount);
  };

  return col;
}
