type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

type BasicValue =
  | BasicArray
  | BasicObject
  | Date
  | boolean
  | number
  | BigInt
  | string
  | undefined;
interface BasicObject {
  [key: string]: BasicValue;
}
type BasicArray = BasicValue[];
type Basic = BasicArray | BasicObject;

type ProxySet = WeakSet<Basic>;
type ProxyMap = WeakMap<Basic, Basic>;
type Listener = () => void;
type TargetMap = WeakMap<Basic, Set<Listener>>;

const proxySet: ProxySet = new Set();
const targetMap: TargetMap = new WeakMap();
const originMap: ProxyMap = new WeakMap();

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isBasicObject(value: unknown): value is BasicObject {
  return isObject(value) && !Array.isArray(value);
}

interface Box<T extends Basic> {
  data: Immutable<T>;
  update: <T extends Basic>(oldProxy: Immutable<T>, payload: T) => void;
  patch: <T extends BasicObject>(
    oldProxy: Immutable<T>,
    payload: Partial<T>
  ) => void;
}

export function watch(target: Basic, listener: () => void): () => void {
  const listeners = targetMap.get(target);
  if (!listeners) {
    throw new Error("Can't subscribe to non box");
  }
  listeners.add(listener);
  return function () {
    listeners.delete(listener);
  };
}

export function getBox<T extends Basic>(origin: T): Box<T> {
  const proxyMap: ProxyMap = new WeakMap();

  return {
    data: makeDeeplyImmutable(origin, proxyMap),

    update(proxyTarget, payload) {
      const realTarget = proxyMap.get(proxyTarget);
      if (!realTarget) throw new Error("Can't update non box");
      if (isBasicObject(realTarget)) {
        if (Array.isArray(payload)) throw new Error("not gonna happen");
        Object.keys(payload).forEach((key) => {
          const value = payload[key];
          realTarget[key as keyof typeof realTarget] = value;
        });
      } else {
        if (!Array.isArray(payload)) throw new Error("not gonna happen");
        payload.forEach((value, i) => {
          realTarget[i] = value;
        });
        realTarget.length = payload.length;
      }
      const listeners = targetMap.get(proxyTarget);
      listeners?.forEach((listener) => listener());
    },

    patch(proxyTarget, payload) {
      const realTarget = proxyMap.get(proxyTarget);
      if (!realTarget) throw new Error("Can't update non box");
      if (Array.isArray(payload) || Array.isArray(realTarget)) {
        throw new Error("Method not allowed on arrays");
      }
      Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if (value === null) delete realTarget[key];
        else realTarget[key] = value;
      });
      const listeners = targetMap.get(proxyTarget);
      listeners?.forEach((listener) => listener());
    },
  };
}

function makeDeeplyImmutable<T extends Basic>(
  origin: T,
  proxyMap: ProxyMap
): Immutable<T> {
  if (proxySet.has(origin)) return origin;

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a deeply immutable object");
    },

    get: (target, property) => {
      const value = target[property as keyof typeof target];
      if (!isObject(value)) return value;
      const oldProxy = originMap.get(value);
      if (oldProxy) return oldProxy;
      const box = makeDeeplyImmutable(value, proxyMap);
      return box;
    },
  });

  proxyMap.set(proxy, origin);
  targetMap.set(proxy, new Set());
  originMap.set(origin, proxy);
  return proxy;
}
