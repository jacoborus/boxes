import type {
  Basic,
  GetThing,
  ListenersMap,
  ReadonlyBasic,
} from "./common_types.ts";
import { copyItem } from "./box.ts";

const SELF = Symbol("self");

export const listenersMap: ListenersMap = new WeakMap();

let watchStack: Map<
  ReadonlyBasic<Basic> | GetThing<unknown>,
  Set<PropertyKey>
> = new Map();
const triggerStack: Set<() => void> = new Set();
let triggerCount = 0;

let isTracking = false;

export function addToTriggerStack(fn: () => void) {
  triggerStack.add(fn);
}

export function lockTriggerStack() {
  triggerCount++;
}

export function unlockTriggerStack() {
  triggerCount--;
  if (triggerCount !== 0) return;
  triggerStack.forEach((fn, key) => {
    triggerStack.delete(key);
    fn();
  });
}

function getHandlersMap<T extends ReadonlyBasic<Basic> | GetThing<unknown>>(
  target: T,
) {
  const handlersMap = listenersMap.get(target);
  if (!handlersMap) {
    throw new Error("Can't subscribe to non box");
  }
  return handlersMap;
}

export function getHandlers<T extends ReadonlyBasic<Basic> | GetThing<unknown>>(
  target: T,
  property?: keyof T,
) {
  const handlersMap = getHandlersMap(target);
  const key = property || SELF;
  return handlersMap.get(key) || handlersMap.set(key, new Set<() => void>())
    .get(key)!;
}

export function getHandlersKeys<
  T extends ReadonlyBasic<Basic> | GetThing<unknown>,
>(
  target: T,
) {
  const handlersMap = getHandlersMap(target);
  return Array.from(handlersMap.keys());
}

export function ping<T extends Basic>(
  value: ReadonlyBasic<T> | GetThing<unknown>,
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

export function watchProp<T extends ReadonlyBasic<Basic>, K extends keyof T>(
  target: T,
  property: K,
  callback: (value: T[K]) => void,
) {
  const handler = () => callback(target[property]);
  const handlers = getHandlers(target, property);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function computed<T>(
  getter: () => T,
) {
  let result: T;
  const getResult = () => result as T;

  isTracking = true;
  result = copyItem(getter());
  const stack = stopTracking();

  const handlersMap = listenersMap.set(getResult, new Map([[SELF, new Set()]]))
    .get(getResult)!;

  const updateResult = () => {
    // TODO: retrack function on every update
    result = copyItem(getter());
    handlersMap.get(SELF)!.forEach((fn) => fn());
  };

  stack.forEach((set, target) => {
    set.forEach((propKey) => {
      if (target instanceof Function) {
        watchThing(target, updateResult);
      } else {
        watchProp(target, propKey as keyof typeof target, updateResult);
      }
    });
  });

  return getResult;
}

export function watchFn<T>(
  getter: () => T,
  callback: (value: T) => void,
) {
  const memo = computed(getter);
  return watchThing(memo as GetThing<T>, callback);
}
