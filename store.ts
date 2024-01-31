import type { Dict, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

type GetterFn<
  S extends Dict,
  G extends GettersConfig<S>,
  K extends keyof G,
> = () => ReturnType<G[K]>;

type Getters<S extends Dict, G extends GettersConfig<S>> = {
  [K in keyof G]: GetterFn<S, G, K>;
};

type GettersConfig<S extends Dict> = Record<
  string,
  (state: ReadonlyBasic<S>, getters: Getters<S, GettersConfig<S>>) => unknown
>;

export function createStore<S extends Dict, G extends GettersConfig<S>>(
  config = { state: () => {}, getters: {} } as { state: () => S; getters: G },
) {
  const box = createBox(config.state());
  const state = box();

  const getters = {} as Getters<S, G>;

  for (const i in config.getters) {
    const getterFactory = config.getters[i];
    getters[i] = function () {
      return getterFactory(state, getters);
    } as GetterFn<S, G, typeof i>;
  }

  return {
    state,
    $reset() {
      box.update(box(), config.state());
    },
    getters,
  };
}

// type StoreConfig<S extends Dict, G extends GettersConfig<S>> = {
//   state: () => S;
//   getters: G;
// };
