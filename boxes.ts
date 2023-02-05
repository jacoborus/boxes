type BasicValue = Date | boolean | number | bigint | string | undefined;

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

type NonReadonly<T> = T extends readonly (infer U)[] ? NonReadonly<U>[] : T;

type ProxyMap = WeakMap<Immutable<Basic>, Basic>;
type OriginMap = WeakMap<Basic, Immutable<Basic>>;
type Listener = () => void;
type TargetMap = WeakMap<Immutable<Basic>, Set<Listener>>;

type BoxFunction<T extends Basic> = () => Immutable<T>;

interface BoxMethods {
  update: <T extends Basic>(proxyTarget: Immutable<Basic>, payload: T) => void;
  patch: <T extends Basic>(
    proxyTarget: Immutable<Basic>,
    payload: Partial<T>,
  ) => void;
  push: <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ) => number;
}

type Box<T extends Basic> = BoxFunction<T> & BoxMethods;

const targetMap: TargetMap = new WeakMap();
const originMap: OriginMap = new WeakMap();

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null &&
    Object.prototype.toString.call(value) !== "[object Date]";
}

function isBasicObject(value: unknown): value is BasicObject {
  return isObject(value) && !Array.isArray(value);
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

function callbackArray<
  T extends BasicArray,
  R,
>(
  proxyTarget: Immutable<T>,
  callback: (target: T) => R,
  proxyMap: ProxyMap,
): R {
  const realTarget = proxyMap.get(proxyTarget);
  if (!realTarget) throw new Error("Can't update non box");
  if (!Array.isArray(realTarget)) {
    throw new Error("Method only allowed on arrays");
  }
  const result = callback(realTarget as T);
  const listeners = targetMap.get(proxyTarget);
  listeners?.forEach((listener) => listener());
  return result;
}

export function getBox<T extends Basic>(origin: T): Box<T> {
  const proxyMap: ProxyMap = new WeakMap();
  const data = makeDeeplyImmutable(origin, proxyMap);
  function box() {
    return data;
  }

  box.update = function (proxyTarget: Immutable<Basic>, payload: Basic) {
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
  };

  box.patch = function (
    proxyTarget: Immutable<Basic>,
    payload: Partial<Basic>,
  ) {
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
  };

  box.copyWithin = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    target: number,
    start: number,
    end?: number,
  ) {
    return callbackArray(
      proxyTarget,
      (realTarget) => realTarget.copyWithin(target, start, end),
      proxyMap,
    );
  };

  box.fill = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    value: T[number],
    start?: number,
    end?: number,
  ) {
    return callbackArray(
      proxyTarget,
      (realTarget) => realTarget.fill(value, start, end),
      proxyMap,
    );
  };

  box.pop = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
  ): Immutable<T>[number] {
    return callbackArray(
      proxyTarget,
      (realTarget) => {
        const result = proxyTarget[proxyTarget.length - 1];
        realTarget.pop();
        return result;
      },
      proxyMap,
    );
  };

  box.push = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return callbackArray(
      proxyTarget,
      (realTarget) => realTarget.push(...payload),
      proxyMap,
    );
  };

  box.reverse = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
  ): Immutable<T> {
    return callbackArray(
      proxyTarget,
      (realTarget) => {
        realTarget.reverse();
        return proxyTarget;
      },
      proxyMap,
    );
  };

  box.shift = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
  ): Immutable<T>[number] {
    return callbackArray(
      proxyTarget,
      (realTarget) => {
        const result = proxyTarget[0];
        realTarget.shift();
        return result;
      },
      proxyMap,
    );
  };

  box.sort = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    sorter?: (a: Immutable<T>[number], b: Immutable<T>[number]) => 0 | 1 | -1,
  ): Immutable<T> {
    return callbackArray(
      proxyTarget,
      (realTarget) => {
        if (!sorter) return proxyTarget;
        realTarget.sort((a, b) => {
          const proxyA = typeof a === "object" ? originMap.get(a as Basic) : a;
          const proxyB = typeof b === "object" ? originMap.get(a as Basic) : b;
          return sorter(
            proxyA as Immutable<T>[number],
            proxyB as Immutable<T>[number],
          );
        });
        return proxyTarget;
      },
      proxyMap,
    );
  };

  // box.splice = function <T extends BasicArray>(
  //   proxyTarget: Immutable<T>,
  //   start: number,
  //   deleteCount?: number,
  //   ...items: Immutable<T>[number][] | T[number][]
  // ) {
  //   return callbackArray(
  //     proxyTarget,
  //     (realTarget) => {
  //       const elements = realTarget.slice(start, deleteCount);
  //       if (deleteCount) {
  //         realTarget.splice(start, deleteCount, ...items);
  //       } else realTarget.splice(start);
  //       return elements;
  //     },
  //     proxyMap,
  //   );
  // };

  box.unshift = function <T extends BasicArray>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return callbackArray(
      proxyTarget,
      (realTarget) => realTarget.unshift(...payload),
      proxyMap,
    );
  };

  return box;
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
      if (targetMap.has(value as Immutable<typeof value>)) return value;
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
