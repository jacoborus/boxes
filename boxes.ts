type Primitive = boolean | number | string | undefined;

interface Dict {
  [key: string]: Primitive | Dict | List;
}
type List = Array<Primitive | List | Dict>;
type Basic = List | Dict;

type ReadonlyDict<T extends Dict> = {
  readonly [k in keyof T]: T[k] extends Primitive ? T[k]
    : T[k] extends Dict ? ReadonlyDict<T[k]>
    : T[k] extends List ? ReadonlyList<T[k]>
    : never;
};

type ReadonlyList<T extends List> = ReadonlyArray<
  T[number] extends Primitive ? T[number]
    : T[number] extends Dict ? ReadonlyDict<T[number]>
    : T[number] extends List ? ReadonlyList<T[number]>
    : never
>;

type ReadonlyBasic<T extends List | Dict> = T extends Dict ? ReadonlyDict<T>
  : T extends List ? ReadonlyList<T>
  : never;

type NonReadonly<T> = T extends readonly (infer U)[] ? NonReadonly<U>[] : T;

type Nullable<T extends Basic> = {
  [K in keyof T]: T[K] | undefined | null;
};

interface BoxMethods {
  update: <T extends Basic>(
    proxyTarget: ReadonlyBasic<Basic>,
    payload: T,
  ) => void;
  patch: <T extends Basic>(
    proxyTarget: ReadonlyBasic<Basic>,
    payload: Nullable<T>,
  ) => void;
  fill: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    val: T[number],
    start?: number,
    end?: number,
  ) => ReadonlyBasic<T>;
  pop: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
  ) => ReadonlyBasic<T>[number];
  push: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ) => number;
  shift: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
  ) => ReadonlyBasic<T>[number];
  sort: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    sorter?: (
      a: ReadonlyBasic<T>[number],
      b: ReadonlyBasic<T>[number],
    ) => number,
  ) => ReadonlyBasic<T>;
  unshift: <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ) => number;
}

type Box<T extends Basic> = BoxMethods & (() => ReadonlyBasic<T>);

const listenersMap: WeakMap<ReadonlyBasic<Basic>, Set<() => void>> =
  new WeakMap();
const originMap: WeakMap<Basic, ReadonlyBasic<Basic>> = new WeakMap();

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isDict(value: unknown): value is Dict {
  return isObject(value) && !Array.isArray(value);
}

export function watch(target: unknown, listener: () => void): () => void {
  const listeners = listenersMap.get(target as ReadonlyBasic<Basic>);
  if (!listeners) {
    throw new Error("Can't subscribe to non box");
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export class ProxyMap extends WeakMap<ReadonlyBasic<Basic>, Basic> {
  alter<T extends List, R>(
    proxyTarget: ReadonlyBasic<T>,
    change: (target: T) => R,
  ) {
    const realTarget = this.get(proxyTarget as unknown as ReadonlyBasic<Basic>);
    if (!realTarget || !Array.isArray(realTarget)) {
      throw new Error("Method only allowed on lists");
    }
    const result = change(realTarget as T);
    const listeners = listenersMap.get(proxyTarget);
    listeners?.forEach((listener) => listener());
    return result;
  }
}

export function createBox<T extends Basic>(origin: T): Box<T> {
  const proxyMap: ProxyMap = new ProxyMap();
  const data = makeReadonly(origin, proxyMap);

  function box() {
    return data;
  }

  box.update = function (proxyTarget: ReadonlyBasic<Basic>, payload: Basic) {
    const realTarget = proxyMap.get(proxyTarget);
    if (!realTarget) throw new Error("Can't update non box");
    if (isDict(realTarget)) {
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
    const listeners = listenersMap.get(proxyTarget);
    listeners?.forEach((listener) => listener());
  };

  box.patch = function (
    proxyTarget: ReadonlyBasic<Basic>,
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
    const listeners = listenersMap.get(proxyTarget);
    listeners?.forEach((listener) => listener());
  };

  box.copyWithin = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    target: number,
    start: number,
    end?: number,
  ) {
    return proxyMap.alter(
      proxyTarget,
      (realTarget) => realTarget.copyWithin(target, start, end),
    );
  };

  box.fill = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    value: T[number],
    start?: number,
    end?: number,
  ) {
    return proxyMap.alter(proxyTarget, (realTarget: T) => {
      realTarget.fill(value, start, end);
      return proxyTarget;
    });
  };

  box.pop = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
  ): ReadonlyBasic<T>[number] {
    return proxyMap.alter(
      proxyTarget,
      (realTarget) => {
        const result = proxyTarget[proxyTarget.length - 1];
        realTarget.pop();
        return result;
      },
    );
  };

  box.push = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return proxyMap.alter(
      proxyTarget,
      (realTarget) => realTarget.push(...payload),
    );
  };

  box.reverse = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
  ): ReadonlyBasic<T> {
    return proxyMap.alter(proxyTarget, (realTarget: T) => {
      realTarget.reverse();
      return proxyTarget;
    });
  };

  box.shift = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
  ): ReadonlyBasic<T>[number] {
    return proxyMap.alter(proxyTarget, (realTarget) => {
      const result = proxyTarget[0];
      realTarget.shift();
      return result;
    });
  };

  box.sort = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    sorter?: (
      a: ReadonlyBasic<T>[number],
      b: ReadonlyBasic<T>[number],
    ) => number,
  ): ReadonlyBasic<T> {
    return proxyMap.alter(proxyTarget, (realTarget: T) => {
      if (!sorter) {
        realTarget.sort();
        return proxyTarget;
      }
      realTarget.sort((a, b) => {
        const proxyA = typeof a === "object" ? originMap.get(a as Basic) : a;
        const proxyB = typeof b === "object" ? originMap.get(b as Basic) : b;
        return sorter(
          proxyA as ReadonlyBasic<T>[number],
          proxyB as ReadonlyBasic<T>[number],
        );
      });
      return proxyTarget;
    });
  };

  box.unshift = function <T extends List>(
    proxyTarget: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return proxyMap.alter(
      proxyTarget,
      (realTarget: T) => realTarget.unshift(...payload),
    );
  };

  return box;
}

function makeReadonly<T extends Basic>(
  origin: T | ReadonlyBasic<T>,
  proxyMap: ProxyMap,
): ReadonlyBasic<T> {
  if (proxyMap.has(origin as ReadonlyBasic<T>)) {
    return origin as ReadonlyBasic<T>;
  }

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a deeply immutable object");
    },

    get: (origin, property) => {
      const value = origin[property as keyof typeof origin];
      if (!isObject(value)) return value;
      if (listenersMap.has(value as ReadonlyBasic<typeof value>)) return value;
      return originMap.get(value) || makeReadonly(value, proxyMap);
    },
  }) as ReadonlyBasic<T>;

  proxyMap.set(proxy, origin as Basic);
  listenersMap.set(proxy, new Set());
  originMap.set(origin as Basic, proxy);
  return proxy;
}
