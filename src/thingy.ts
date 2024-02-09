import type { GetThing, NonObjectNull, SetThing } from "./common_types.ts";

import { listenersMap, ping } from "./reactive.ts";
import { SELF } from "./symbols.ts";

export function createThingy<T>(
  input: NonObjectNull<T>,
): [GetThing<T>, SetThing<T>] {
  if (!isPrimitive(input)) throw new Error("Can't box non-primitive");
  let origin = input;
  const getThing = () => {
    ping(getThing);
    return origin;
  };
  listenersMap.set(getThing, new Map());

  return [
    getThing,
    (value: NonObjectNull<T>) => {
      if (origin === value) return;
      if (!isPrimitive(value)) throw new Error("Can't box non-primitive");
      origin = value;
      listenersMap.get(getThing)?.get(SELF)?.forEach((listener) =>
        listener(origin)
      );
    },
  ];
}

function isPrimitive<T>(x: unknown): x is NonObjectNull<T> {
  return !(x instanceof Object) || x !== null;
}
