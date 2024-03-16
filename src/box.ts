import type { Basic, Boxed, Nullable, ProxyMap } from "./common_types.ts";
import { inbox } from "./inbox.ts";
import { $merge, $set, $update } from "./alter.ts";

type SetBox<T extends Basic> = {
  apply: (target: Boxed<T>, thisArg: unknown, argArray: unknown[]) => void;
  update: (payload: T) => void;
  merge: (payload: Nullable<Basic>) => void;
};

export function createBox<T extends Basic>(source: T): [Boxed<T>, SetBox<T>] {
  const proxyMap: ProxyMap = new WeakMap();
  const box: Boxed<T> = inbox(source, proxyMap);

  function setBox(
    key: keyof T,
    value: Nullable<T>,
  ) {
    $set(box, key, value, proxyMap);
  }

  setBox.update = function (payload: T): void {
    $update(box, payload, proxyMap);
  };

  setBox.merge = function (payload: Nullable<Basic>): void {
    $merge(box, payload, proxyMap);
  };

  return [box, setBox];
}
