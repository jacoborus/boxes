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

type SetCol<T extends List> = {
  apply: (target: Boxed<T>, thisArg: unknown, argArray: unknown[]) => void;
  insert: (
    payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
    position?: number,
  ) => void;
  remove: (filter: (i: BoxedList<T>[keyof BoxedList<T>]) => boolean) => void;
  extract: (
    first?: number,
    amount?: number,
  ) => NonReadonlyList<T[number]>[];
};

export function createCollection<T extends List>(
  source: T,
): [BoxedList<T>, SetCol<T>] {
  const proxyMap: ProxyMap = new WeakMap();
  const col = inbox(source, proxyMap) as BoxedList<T>;

  function setCol(key: keyof T, value: Nullable<T>) {
    $set(col as Boxed<T>, key, value, proxyMap);
  }

  setCol.insert = function <T extends List>(
    payload: NonReadonlyList<T[number]> | NonReadonlyList<T[number]>[],
    position = col.length,
  ): void {
    $insert(proxyMap, col as Boxed<List>, payload, position as number);
  };

  setCol.remove = function (
    filter: <B extends BoxedList<T>>(i: B[keyof B]) => boolean,
  ) {
    const index = col.findIndex(filter);
    if (index === -1) return;
    $remove(proxyMap, col, index, 1);
  };

  setCol.extract = function (first?: number, amount?: number) {
    return $remove(proxyMap, col, first, amount) as NonReadonlyList<
      T[number]
    >[];
  };

  return [col, setCol];
}