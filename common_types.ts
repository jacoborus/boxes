export type NonObjectNull<T> = T extends object ? never
  : T extends null ? never
  : T;
export type Primitive = NonObjectNull<unknown>;
export type List = Array<Primitive | List | Dict>;
export interface Dict {
  [key: string]: Primitive | Dict | List;
}
export type Basic = List | Dict;

type ReadonlyDict<T extends Dict> = {
  readonly [k in keyof T]: T[k] extends Primitive ? T[k]
    : T[k] extends Basic ? ReadonlyBasic<T[k]>
    : never;
};

export type ReadonlyList<T extends List> = ReadonlyArray<
  T[number] extends Primitive ? T[number]
    : T[number] extends Basic ? ReadonlyBasic<T[number]>
    : never
>;

export type ReadonlyBasic<T extends Basic> = T extends Dict ? ReadonlyDict<T>
  : T extends List ? ReadonlyList<T>
  : never;

export type NonReadonlyList<T> = T extends readonly (infer U)[]
  ? NonReadonlyList<U>[]
  : T;

export type Nullable<T extends Basic> = {
  [K in keyof T]: T[K] | undefined | null;
};

export type GetThing<T> = () => NonObjectNull<T>;
export type SetThing<T> = (input: NonObjectNull<T>) => void;

export type ProxyMap = WeakMap<ReadonlyBasic<Basic>, Basic>;
export type ListenersMap = WeakMap<
  ReadonlyBasic<Basic> | GetThing<unknown>,
  Set<() => void>
>;

export type Computed<T> = {
  value: T;
};
