type BasicValue = Date | boolean | number | BigInt | string | undefined;

interface BasicObject {
  [key: string]: BasicValue | BasicObject | BasicArray;
}
type BasicArray = Array<BasicValue | BasicArray | BasicObject>;
type Basic = BasicArray | BasicObject;

type ImmutableObject<T extends BasicObject> = {
  readonly [k in keyof T]: T[k] extends BasicValue ? BasicValue
    : T[k] extends BasicObject ? ImmutableObject<T[k]>
    : ReadonlyArray<T[k]>;
};

type ImmutableArray<T extends BasicArray> = ReadonlyArray<
  T[number] extends BasicValue ? BasicValue
    : T[number] extends BasicObject ? ImmutableObject<T[number]>
    : ReadonlyArray<T[number]>
>;

type Immutable<T extends BasicArray | BasicObject> = T extends BasicObject
  ? ImmutableObject<T>
  : T extends BasicArray ? ImmutableArray<T>
  : never;

type ProxyMap = WeakMap<Immutable<Basic>, Basic>;
type OriginMap = WeakMap<Basic, Immutable<Basic>>;
type Listener = () => void;
type TargetMap = WeakMap<Immutable<Basic>, Set<Listener>>;

const targetMap: TargetMap = new WeakMap();
const originMap: OriginMap = new WeakMap();

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isBasicObject(value: unknown): value is BasicObject {
  return isObject(value) && !Array.isArray(value);
}

interface BoxContainer<T extends Basic> {
  box: Immutable<T>;
  update: <T extends Basic>(oldProxy: Immutable<T>, payload: T) => void;
  patch: <T extends BasicObject>(
    oldProxy: Immutable<T>,
    payload: Partial<T>,
  ) => void;
}

export function watch(target: unknown, listener: () => void): () => void {
  const listeners = targetMap.get(target as Immutable<Basic>);
  if (!listeners) {
    throw new Error("Can't subscribe to non box");
  }
  listeners.add(listener);
  return function () {
    listeners.delete(listener);
  };
}

export function getBox<T extends Basic>(origin: T): BoxContainer<T> {
  const proxyMap: ProxyMap = new WeakMap();

  return {
    box: makeDeeplyImmutable(origin, proxyMap),

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
  origin: T | Immutable<T>,
  proxyMap: ProxyMap,
): Immutable<T> {
  if (proxyMap.has(origin as Immutable<T>)) return origin as Immutable<T>;

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a deeply immutable object");
    },

    get: (origin, property) => {
      const value = origin[property as keyof typeof origin];
      if (!isObject(value)) return value;
      const oldProxy = originMap.get(value);
      if (oldProxy) return oldProxy;
      const newProxy = makeDeeplyImmutable(value, proxyMap);
      return newProxy;
    },
  }) as Immutable<T>;

  proxyMap.set(proxy, origin as Basic);
  targetMap.set(proxy, new Set());
  originMap.set(origin as Basic, proxy);
  return proxy;
}
