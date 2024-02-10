import type {
  Basic,
  Fn1,
  GetThing,
  ListenersMap,
  ReadonlyBasic,
} from "./common_types.ts";

import { SELF } from "./symbols.ts";

export const listenersMap: ListenersMap = new WeakMap();
let watchStack: Map<
  ReadonlyBasic<Basic> | GetThing<unknown>,
  Set<PropertyKey>
> = new Map();
const triggerStack: Set<() => void> = new Set();
const triggerKeys = new Set<symbol>();

let isTracking = false;

export function openTriggerStack(key: symbol) {
  triggerKeys.add(key);
}

export function addToTriggerStack(fn: () => void) {
  triggerStack.add(fn);
}

export function closeTriggerStack(key: symbol) {
  triggerKeys.delete(key);
  if (triggerKeys.size !== 0) return;
  triggerStack.forEach((fn, key) => {
    triggerStack.delete(key);
    fn();
  });
}

export function getHandlers<T extends ReadonlyBasic<Basic> | GetThing<unknown>>(
  target: T,
  property?: keyof T,
) {
  const handlersMap = listenersMap.get(target);
  if (!handlersMap) {
    throw new Error("Can't subscribe to non box");
  }
  const key = property || SELF;
  return handlersMap.get(key) || handlersMap.set(key, new Set<Fn1>())
    .get(key)!;
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
  const handlers = getHandlers(target, property);
  const handler = () => callback(target[property]);
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function watchFn<T>(
  getter: () => T,
  callback: (value: T) => void,
) {
  isTracking = true;
  const computed = { value: getter() };
  const stack = stopTracking();
  const offStack: (() => void)[] = [];

  function finalCallback() {
    const newValue = getter();
    if (newValue === computed.value) return;
    callback(getter());
  }

  stack.forEach((set, target) => {
    set.forEach((propKey) => {
      const isThing = target instanceof Function;
      let value = isThing ? target() : target[propKey as number];

      const trigger = (newValue: typeof value) => {
        if (value === newValue) return;
        value = newValue as typeof value;
        finalCallback();
      };

      if (isThing) {
        offStack.push(watchThing(target, trigger));
      } else {
        offStack.push(
          watchProp(target, propKey as keyof typeof target, trigger),
        );
      }
    });
  });
  return () => offStack.forEach((fn) => fn());
}
