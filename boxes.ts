type Primitive = boolean | number | string | undefined;

interface Dict {
  [key: string]: Primitive | Dict | List;
}
type List = Array<Primitive | List | Dict>;
type Basic = List | Dict;

type ImmutableDict<T extends Dict> = {
  readonly [k in keyof T]: T[k] extends Primitive ? Primitive
    : T[k] extends Dict ? ImmutableDict<T[k]>
    : T[k] extends List ? ImmutableList<T[k]>
    : never;
};

type ImmutableList<T extends List> = ReadonlyArray<
  T[number] extends Primitive ? Primitive
    : T[number] extends Dict ? ImmutableDict<T[number]>
    : T[number] extends List ? ImmutableList<T[number]>
    : never
>;

type Immutable<T extends List | Dict> = T extends Dict ? ImmutableDict<T>
  : T extends List ? ImmutableList<T>
  : never;

type NonReadonly<T> = T extends readonly (infer U)[] ? NonReadonly<U>[] : T;

type Nullable<T extends Basic> = {
  [K in keyof T]: T[K] | undefined | null;
};

interface BoxMethods {
  update: <T extends Basic>(proxyTarget: Immutable<Basic>, payload: T) => void;
  patch: <T extends Basic>(
    proxyTarget: Immutable<Basic>,
    payload: Nullable<T>,
  ) => void;
  fill: <T extends List>(
    proxyTarget: Immutable<T>,
    val: T[number],
    start?: number,
    end?: number,
  ) => Immutable<T>;
  pop: <T extends List>(proxyTarget: Immutable<T>) => Immutable<T>[number];
  push: <T extends List>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ) => number;
  shift: <T extends List>(proxyTarget: Immutable<T>) => Immutable<T>[number];
  sort: <T extends List>(
    proxyTarget: Immutable<T>,
    sorter?: (a: Immutable<T>[number], b: Immutable<T>[number]) => number,
  ) => Immutable<T>;
  unshift: <T extends List>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ) => number;
}

type Box<T extends Basic> = BoxMethods & (() => Immutable<T>);

const targetMap: WeakMap<Immutable<Basic>, Set<() => void>> = new WeakMap();
const originMap: WeakMap<Basic, Immutable<Basic>> = new WeakMap();

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isBasicObject(value: unknown): value is Dict {
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

class ProxyMap extends WeakMap<Immutable<Basic>, Basic> {
  callback<T extends List, R>(
    proxyTarget: Immutable<T>,
    callback: (target: T) => R,
  ) {
    const realTarget = this.get(proxyTarget as unknown as Immutable<Basic>);
    if (!realTarget) throw new Error("Can't update non box");
    if (!Array.isArray(realTarget)) {
      throw new Error("Method only allowed on arrays");
    }
    const result = callback(realTarget as unknown as T);
    const listeners = targetMap.get(proxyTarget);
    listeners?.forEach((listener) => listener());
    return result;
  }
}

function callbackArray<T extends List, R>(
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
  const proxyMap: ProxyMap = new ProxyMap();
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
    payload: Nullable<Basic>,
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

  box.copyWithin = function <T extends List>(
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

  box.fill = function <T extends List>(
    proxyTarget: Immutable<T>,
    value: T[number],
    start?: number,
    end?: number,
  ) {
    return proxyMap.callback(proxyTarget, <T extends List>(realTarget: T) => {
      realTarget.fill(value, start, end);
      return proxyTarget;
    });
  };

  box.pop = function <T extends List>(
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

  box.push = function <T extends List>(
    proxyTarget: Immutable<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return callbackArray(
      proxyTarget,
      (realTarget) => realTarget.push(...payload),
      proxyMap,
    );
  };

  box.reverse = function <T extends List>(
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

  box.shift = function <T extends List>(
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

  box.sort = function <T extends List>(
    proxyTarget: Immutable<T>,
    sorter?: (a: Immutable<T>[number], b: Immutable<T>[number]) => number,
  ): Immutable<T> {
    return callbackArray(
      proxyTarget,
      (realTarget) => {
        if (!sorter) {
          realTarget.sort();
          return proxyTarget;
        }
        realTarget.sort((a, b) => {
          const proxyA = typeof a === "object" ? originMap.get(a as Basic) : a;
          const proxyB = typeof b === "object" ? originMap.get(b as Basic) : b;
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

  box.unshift = function <T extends List>(
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
      return makeDeeplyImmutable(value, proxyMap);
    },
  }) as Immutable<T>;

  proxyMap.set(proxy, origin as Basic);
  targetMap.set(proxy, new Set());
  originMap.set(origin as Basic, proxy);
  return proxy;
}
