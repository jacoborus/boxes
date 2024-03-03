import type {
  Basic,
  Boxed,
  BoxedList,
  GetThing,
  List,
  ListenersMap,
} from "./common_types.ts";
import { copyItem } from "./inbox.ts";

const SELF = Symbol("self");

export const listenersMap: ListenersMap = new WeakMap();

let watchStack: Map<
  Boxed<Basic> | GetThing<unknown>,
  Set<PropertyKey>
> = new Map();
const triggerStack: Set<() => void> = new Set();
let triggerCount = 0;

let isTracking = false;

export function isBoxed(
  value: unknown,
): value is Boxed<Basic> {
  return listenersMap.has(value as Boxed<Basic>);
}

export function addToTriggerStack(fns: Set<() => void>) {
  fns.forEach((fn) => triggerStack.add(fn));
}

export function batch(callback: () => unknown) {
  triggerCount++;
  callback();
  triggerCount--;
  if (triggerCount !== 0) return;
  triggerStack.forEach((fn, key) => {
    triggerStack.delete(key);
    fn();
  });
}

export function getHandlersMap<
  T extends Boxed<Basic> | GetThing<unknown>,
>(
  target: T,
) {
  const handlersMap = listenersMap.get(target);
  if (!handlersMap) {
    throw new Error("Can't subscribe to non box");
  }
  return handlersMap;
}

export function getHandlers<T extends Boxed<Basic> | GetThing<unknown>>(
  target: T,
  property?: keyof T,
) {
  const handlersMap = getHandlersMap(target);
  const key = property || SELF;
  return handlersMap.get(key) || handlersMap.set(key, new Set<() => void>())
    .get(key)!;
}

export function ping<T extends Basic>(
  value: Boxed<T> | GetThing<unknown>,
  prop?: keyof T,
) {
  if (!isTracking) return;
  const stack = watchStack.get(value) ||
    watchStack.set(value, new Set()).get(value)!;
  stack.add(prop || SELF);
}

function stopTracking() {
  isTracking = false;
  const stack = watchStack;
  watchStack = new Map();
  return stack;
}

export function watchThing<T>(
  target: GetThing<T>,
  callback: (value: T) => void,
) {
  const handler = () => callback(target());
  const handlers = getHandlers(target);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function watchProp<T extends Boxed<Basic>, K extends keyof T>(
  target: T,
  property: K,
  callback: (value: T[K]) => void,
) {
  const handler = () => callback(target[property]);
  const handlers = getHandlers(target, property);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function watchComp<
  T extends Boxed<Basic> | GetThing<unknown>,
  K extends keyof T,
>(
  target: T,
  property: K,
  handler: () => void,
) {
  const handlers = getHandlers(target, property);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

const proxyMap = new WeakMap();

/**
 * Creates a computed value derived from a getter function. Its dependencies
 * get tracked for automatic updates.
 * @param getter The function to compute the value
 * @returns The computed value
 */
export function computed<T>(
  getter: () => T,
) {
  let result: T;
  const getResult = () => result as T;

  const handlersMap = listenersMap.set(getResult, new Map([[SELF, new Set()]]))
    .get(getResult)!;

  let offStack: (() => void)[] = [];

  const updateResult = () => {
    offStack.forEach((off) => off());
    offStack = [];

    isTracking = true;
    const preResult = copyItem(getter(), proxyMap);
    const stack = stopTracking();

    stack.forEach((set, target) => {
      set.forEach((propKey) => {
        offStack.push(
          watchComp(target, propKey as keyof typeof target, updateResult),
        );
      });
    });

    if (preResult === result) return;
    result = preResult;
    handlersMap.get(SELF)!.forEach((fn) => fn());
  };

  updateResult();

  return getResult;
}

export function watch<T>(
  getter: () => T,
  callback: (value: T) => void,
) {
  const memo = computed(getter);
  return watchThing(memo as GetThing<T>, callback);
}

/**
 * Iterates through the handlers for a proxy, stacking them if their corresponding keys were updated.
 * @param proxy The proxy value.
 * @param updatedKeys The keys that were updated.
 */
export function stackListeners(
  proxy: Boxed<Basic>,
  updatedKeys: PropertyKey[],
) {
  const keys = getHandlersMap(proxy).keys();
  let nextKey = keys.next();
  while (!nextKey.done) {
    const key = nextKey.value;
    if (updatedKeys.includes(key)) {
      addToTriggerStack(getHandlers(proxy, nextKey.value as number));
    }
    nextKey = keys.next();
  }
}

/**
 * Triggers listeners for a boxed list from a given index onwards.
 * @param proxy The list proxy value.
 * @param first The index from which to trigger listeners.
 */
export function triggerListFrom(proxy: BoxedList<List>, first: number) {
  const keys = getHandlersMap(proxy).keys();
  batch(() => {
    let nextKey = keys.next();
    while (!nextKey.done) {
      const key = nextKey.value;
      if (key as number >= first) {
        addToTriggerStack(getHandlers(proxy, key as number));
      }
      nextKey = keys.next();
    }
  });
}
