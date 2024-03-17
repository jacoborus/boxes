export type NonObjectNull<T> = T extends object ? never
  : T extends null ? never
  : T;
export type Primitive = NonObjectNull<unknown>;
export type List = Array<Primitive | List | Dict>;
export interface Dict {
  [key: PropertyKey]: Primitive | Dict | List;
}
export type Basic = List | Dict;

type BoxedDict<T extends Dict> = {
  readonly [k in keyof T]: T[k] extends Primitive ? T[k]
  : T[k] extends Basic ? Boxed<T[k]>
  : never;
};

export type BoxedList<T extends List> = ReadonlyArray<
  T[number] extends Primitive ? T[number]
  : T[number] extends Basic ? Boxed<T[number]>
  : never
>;

export type Boxed<T extends Basic> = T extends Dict ? BoxedDict<T>
  : T extends List ? BoxedList<T>
  : never;

export type NonReadonlyList<T> = T extends readonly (infer U)[]
  ? NonReadonlyList<U>[]
  : T;

export type Nullable<T extends Basic> = {
  [K in keyof T]: T[K] | undefined | null;
};

export type GetThing<T> = () => NonObjectNull<T>;
export type SetThing<T> = (input: NonObjectNull<T>) => T;

export type ProxyMap = WeakMap<Boxed<Basic>, Basic>;

export type ListenersMap = WeakMap<
  Boxed<Basic> | GetThing<unknown>,
  Map<PropertyKey, Set<() => void>>
>;

export type Fn1 = (value: unknown) => void;

export type Computed<T> = {
  value: T;
};
