import type { Dict, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

interface GettersConfig<S extends Dict> {
  [K: string]: (state: ReadonlyBasic<S>, getters: Getters<S, this>) => unknown;
}

type Getters<S extends Dict, G extends GettersConfig<S>> = {
  [K in keyof G]: () => ReturnType<G[K]>;
};

export function createStore<
  S extends Dict,
  G extends GettersConfig<S>,
>(
  config: { state: () => S; getters?: G },
) {
  const gettersConfig = config.getters || {} as G;
  const box = createBox(config.state());
  const state = box();

  const getters = {} as Getters<S, G>;

  for (const i in gettersConfig) {
    const getterFactory = gettersConfig[i];
    getters[i] = function () {
      return getterFactory(state, getters);
    } as Getters<S, G>[typeof i];
  }

  return {
    state,
    $reset() {
      box.update(box(), config.state());
    },
    getters,
  };
}
