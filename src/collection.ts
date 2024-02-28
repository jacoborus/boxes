import type {
  BoxedList,
  List,
  NonReadonlyList,
  ProxyMap,
} from "./common_types.ts";
import { inbox } from "./inbox.ts";
import { $insert, $merge, $remove } from "./alter.ts";

export function createCollection<T extends List>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const mirror = inbox(source, proxyMap) as BoxedList<T>;

  function col(payload?: T) {
    if (payload !== undefined) {
      $merge(proxyMap, mirror, payload);
    }
    return mirror;
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
