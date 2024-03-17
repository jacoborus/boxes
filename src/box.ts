import type { Boxed, Dict, Nullable, ProxyMap } from "./common_types.ts";
import { inbox } from "./inbox.ts";
import { $merge, $set, $update } from "./alter.ts";

type SetBox<T extends Dict> = {
  (value: T): void;
  (key: keyof T, value: T[keyof T]): void;
  merge: (payload: Nullable<Dict>) => void;
};

export function createBox<T extends Dict>(source: T): [Boxed<T>, SetBox<T>] {
  const proxyMap: ProxyMap = new WeakMap();
  const box: Boxed<T> = inbox(source, proxyMap);

  function setBox(value: T): void;
  function setBox(key: keyof T, value: T[keyof T]): void;
  function setBox(
    keyOrValue: T | keyof T,
    value?: T[keyof T],
  ): void {
    if (1 in arguments) {
      $set(box, keyOrValue as keyof T, value as Nullable<T>, proxyMap);
    } else {
      $update(box, keyOrValue as T, proxyMap);
    }
  }

  setBox.merge = function (payload: Nullable<Dict>): void {
    $merge(box, payload, proxyMap);
  };

  return [box, setBox];
}
