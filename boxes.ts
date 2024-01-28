type Primitive = boolean | number | string | undefined;
type Basic = List | Dict;
type List = Array<Primitive | List | Dict>;
interface Dict {
  [key: string]: Primitive | Dict | List;
}

type ReadonlyDict<T extends Dict> = {
  readonly [k in keyof T]: T[k] extends Primitive ? T[k]
    : T[k] extends Basic ? ReadonlyBasic<T[k]>
    : never;
};

type ReadonlyList<T extends List> = ReadonlyArray<
  T[number] extends Primitive ? T[number]
    : T[number] extends Basic ? ReadonlyBasic<T[number]>
    : never
>;

type ReadonlyBasic<T extends Basic> = T extends Dict ? ReadonlyDict<T>
  : T extends List ? ReadonlyList<T>
  : never;

type NonReadonly<T> = T extends readonly (infer U)[] ? NonReadonly<U>[] : T;

type Nullable<T extends Basic> = {
  [K in keyof T]: T[K] | undefined | null;
};

type ProxyMap = WeakMap<ReadonlyBasic<Basic>, Basic>;

function isObject(value: unknown): value is Basic {
  return typeof value === "object" && value !== null;
}

function isDict(value: unknown): value is Dict {
  return isObject(value) && !Array.isArray(value);
}

function isBoxed(
  value: unknown,
): value is ReadonlyBasic<Basic> {
  return listenersMap.has(value as ReadonlyBasic<Basic>);
}

const listenersMap: WeakMap<ReadonlyBasic<Basic>, Set<() => void>> =
  new WeakMap();
const originMap: WeakMap<Basic, ReadonlyBasic<Basic>> = new WeakMap();

function copyDict<T extends Dict>(origin: T, proxyMap: ProxyMap): T {
  const result = {} as unknown as T;
  for (const i in origin) {
    const item = origin[i];
    if (item === undefined || item === null) continue;
    if (!isObject(item)) {
      result[i] = item;
    } else if (isBoxed(item)) {
      result[i as keyof T] = proxyMap.get(item) as T[keyof T];
    } else {
      const [data] = inbox(item, proxyMap);
      result[i] = data;
    }
  }
  return result;
}

function copyList<T extends List>(origin: T, proxyMap: ProxyMap): T {
  const result = [] as unknown as T;
  for (const item of origin) {
    if (!isObject(item)) {
      result.push(item);
    } else if (isBoxed(item)) {
      result.push(proxyMap.get(item));
    } else {
      const [data] = inbox(item, proxyMap);
      result.push(data);
    }
  }
  return result;
}

function inbox<T extends Basic>(
  input: T,
  proxyMap: ProxyMap,
): [T, ReadonlyBasic<T>] {
  const origin = Array.isArray(input)
    ? copyList(input, proxyMap)
    : copyDict(input, proxyMap);

  const proxy = new Proxy(origin, {
    set: () => {
      throw new Error("Cannot modify a readonly object");
    },

    get: (origin, property) => {
      const value = origin[property as keyof typeof origin];
      if (!isObject(value) || isBoxed(value)) return value;
      return originMap.get(value);
    },
  }) as ReadonlyBasic<T>;

  proxyMap.set(proxy, origin);
  originMap.set(origin, proxy);
  listenersMap.set(proxy, new Set());

  return [origin as T, proxy];
}

export function watch(target: unknown, listener: () => void): () => void {
  const listeners = listenersMap.get(target as ReadonlyBasic<Basic>);
  if (!listeners) {
    throw new Error("Can't subscribe to non box");
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function createBox<T extends Basic>(source: T) {
  const proxyMap: ProxyMap = new WeakMap();
  const [_, data] = inbox(source, proxyMap);

  function alter<T extends List, R>(
    proxy: ReadonlyList<T>,
    change: (target: T) => R,
  ) {
    const target = proxyMap.get(
      proxy as unknown as ReadonlyBasic<Basic>,
    );
    if (!target || !Array.isArray(target)) {
      throw new Error("Method only allowed on lists");
    }
    const result = change(target as T);
    const listeners = listenersMap.get(proxy as ReadonlyBasic<Basic>);
    listeners?.forEach((listener) => listener());
    return result;
  }

  function box() {
    return data;
  }

  box.update = function (proxy: ReadonlyBasic<Basic>, payload: Basic) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (isDict(target)) {
      if (Array.isArray(payload)) throw new Error("not gonna happen");
      for (const key in payload) {
        const value = payload[key as keyof typeof payload];
        if (!isObject(value)) {
          target[key] = value;
        } else if (isBoxed(value)) {
          target[key] = proxyMap.get(value);
        } else {
          target[key] = inbox(value, proxyMap)[0];
        }
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

  box.patch = function (proxy: ReadonlyBasic<Basic>, payload: Nullable<Basic>) {
    const target = proxyMap.get(proxy);
    if (!target) throw new Error("Can't update non box");
    if (Array.isArray(payload) || Array.isArray(target)) {
      throw new Error("Method not allowed on arrays");
    }
    for (const key in payload) {
      const value = payload[key];
      if (value === null) delete target[key];
      else {
        if (!isObject(value)) {
          target[key] = value;
        } else if (isBoxed(value)) {
          target[key] = proxyMap.get(value);
        } else {
          target[key] = inbox(value, proxyMap)[0];
        }
      }
    }
    const listeners = listenersMap.get(proxy);
    listeners?.forEach((listener) => listener());
  };

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
    first = proxy.length,
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
