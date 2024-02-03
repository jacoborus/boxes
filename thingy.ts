type NonObjectNull<T> = T extends object ? never
  : T extends null ? never
  : T;

type GetThing<T> = () => NonObjectNull<T>;
type SetThing<T> = (input: NonObjectNull<T>) => void;

const listenersMap = new WeakMap<GetThing<unknown>, Set<() => void>>();

function isPrimitive<T>(x: unknown): x is NonObjectNull<T> {
  return !(x instanceof Object) || x !== null;
}

export function createThingy<T>(
  input: NonObjectNull<T>,
): [GetThing<T>, SetThing<T>] {
  if (!isPrimitive(input)) {
    throw new Error("Can't box non-primitive");
  }
  let origin = input;
  const getThing = () => origin;
  listenersMap.set(getThing, new Set());

  return [
    getThing,
    (value: NonObjectNull<T>) => {
      if (origin === value) return;
      if (!isPrimitive(value)) {
        throw new Error("Can't box non-primitive");
      }
      origin = value;
      listenersMap.get(getThing)?.forEach((listener) => listener());
    },
  ];
}

export function watch<T>(target: GetThing<T>, listener: () => void) {
  const listeners = listenersMap.get(target);
  if (!listeners) {
    throw new Error("Can't subscribe to non box");
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}
