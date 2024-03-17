import type { GetThing, NonObjectNull, SetThing } from "./common_types.ts";
import {
  addToTriggerStack,
  batch,
  getHandlers,
  listenersMap,
  ping,
} from "./reactivity.ts";

export function createThingy<T>(
  input: NonObjectNull<T>,
): [GetThing<T>, SetThing<T>] {
  if (!isPrimitive(input)) {
    throw new Error("Can't box non-primitive");
  }
  let origin = input;

  const getThing: GetThing<T> = () => {
    ping(getThing);
    return origin;
  };

  listenersMap.set(getThing, new Map());

  return [
    getThing,

    ((value) => {
      if (origin === value) return;
      if (!isPrimitive(value)) throw new Error("Can't box non-primitive");
      origin = value;
      batch(() => addToTriggerStack(getHandlers(getThing)));
      return origin;
    }) as SetThing<T>,
  ];
}

function isPrimitive<T>(x: unknown): x is NonObjectNull<T> {
  return !(x instanceof Object) || x !== null;
}
