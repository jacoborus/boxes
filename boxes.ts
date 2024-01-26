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

export function createBox<T extends Basic>(origin: T) {
  const proxyMap: WeakMap<ReadonlyBasic<Basic>, Basic> = new WeakMap();
  const data = makeReadonly(origin, proxyMap);

  function box() {
    return data;
  }

  function alter<T extends List, R>(
    proxy: ReadonlyBasic<T>,
    change: (target: T) => R,
  ) {
    const target = proxyMap.get(
      proxy as unknown as ReadonlyBasic<Basic>,
    );
    if (!target || !Array.isArray(target)) {
      throw new Error("Method only allowed on lists");
    }
    const result = change(target as T);
    const listeners = listenersMap.get(proxy);
    listeners?.forEach((listener) => listener());
    return result;
  }

  box.update = function (proxy: ReadonlyBasic<Basic>, payload: Basic) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (isDict(target)) {
      if (Array.isArray(payload)) throw new Error("not gonna happen");
      for (const key in payload) {
        target[key as keyof typeof target] = payload[key];
      }
    } else {
      if (!Array.isArray(payload)) throw new Error("not gonna happen");
      payload.forEach((value, i) => {
        target[i] = value;
      });
      target.length = payload.length;
    }
    const listeners = listenersMap.get(proxy);
    listeners?.forEach((listener) => listener());
  };

  box.patch = function (
    proxy: ReadonlyBasic<Basic>,
    payload: Nullable<Basic>,
  ) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (Array.isArray(payload) || Array.isArray(target)) {
      throw new Error("Method not allowed on arrays");
    }
    for (const key in payload) {
      const value = payload[key];
      if (value === null) delete target[key];
      else target[key] = value;
    }
    const listeners = listenersMap.get(proxy);
    listeners?.forEach((listener) => listener());
  };

  // JS methods
  box.push = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return alter(
      proxy,
      (target) => target.push(...payload),
    );
  };

  box.pop = function <T extends List>(
    proxy: ReadonlyBasic<T>,
  ): ReadonlyBasic<T>[number] {
    return alter(
      proxy,
      (target) => {
        const result = proxy[proxy.length - 1];
        target.pop();
        return result;
      },
    );
  };

  box.shift = function <T extends List>(
    proxy: ReadonlyBasic<T>,
  ): ReadonlyBasic<T>[number] {
    return alter(proxy, (target) => {
      const result = proxy[0];
      target.shift();
      return result;
    });
  };

  box.unshift = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    ...payload: NonReadonly<T[number]>[]
  ): number {
    return alter(
      proxy,
      (target: T) => target.unshift(...payload),
    );
  };

  // TODO: test
  box.reverse = function <T extends List>(
    proxy: ReadonlyBasic<T>,
  ): ReadonlyBasic<T> {
    return alter(proxy, (target: T) => {
      target.reverse();
      return proxy;
    });
  };

  box.sort = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    sorter?: (
      a: ReadonlyBasic<T>[number],
      b: ReadonlyBasic<T>[number],
    ) => number,
  ): ReadonlyBasic<T> {
    return alter(proxy, (target: T) => {
      if (!sorter) {
        target.sort();
        return proxy;
      }
      target.sort((a, b) => {
        const proxyA = typeof a === "object" ? originMap.get(a as Basic) : a;
        const proxyB = typeof b === "object" ? originMap.get(b as Basic) : b;
        return sorter(
          proxyA as ReadonlyBasic<T>[number],
          proxyB as ReadonlyBasic<T>[number],
        );
      });
      return proxy;
    });
  };

  // Custom methods
  box.insert = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    position: number,
    ...payload: NonReadonly<T[number]>[]
  ): void {
    return alter(
      proxy,
      (target) => {
        if (isNaN(position)) throw new Error("Position must be a number");
        target.splice(position, 0, ...payload);
      },
    );
  };

  box.extract = function <T extends List>(
    proxy: ReadonlyBasic<T>,
    first: number,
    amount = 1,
  ): T[number][] {
    return alter(
      proxy,
      (target) => {
        if (isNaN(first) || isNaN(amount)) {
          throw new Error("First and amount must be a number");
        }
        return target.splice(first, amount);
      },
    );
  };

  return box;
}

function makeReadonly<T extends Basic>(
  origin: T | ReadonlyBasic<T>,
  proxyMap: WeakMap<ReadonlyBasic<Basic>, Basic>,
): ReadonlyBasic<T> {
  if (proxyMap.has(origin as ReadonlyBasic<T>)) {
    return origin as ReadonlyBasic<T>;
  }

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a readonly object");
    },

    get: (origin, property) => {
      const value = origin[property as keyof typeof origin];
      if (
        !isObject(value) ||
        listenersMap.has(value as ReadonlyBasic<typeof value>)
      ) return value;
      return originMap.get(value) || makeReadonly(value, proxyMap);
    },
  }) as ReadonlyBasic<T>;

  proxyMap.set(proxy, origin as Basic);
  listenersMap.set(proxy, new Set());
  originMap.set(origin as Basic, proxy);
  return proxy;
}
