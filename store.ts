import type { Dict, ReadonlyBasic } from "./common_types.ts";
import { createBox } from "./boxes.ts";

interface GettersConfig<S extends Dict, G extends GettersConfig<S, G>> {
  [K: string]: (state: ReadonlyBasic<S>, getters: Getters<S, G>) => unknown;
}

type Getters<S extends Dict, G extends GettersConfig<S, G>> = {
  [K in keyof G]: () => ReturnType<G[K]>;
};

export function createStore<
  S extends Dict,
  G extends GettersConfig<S, G>,
>(
  initState: () => S,
  gettersConfig: G,
) {
  const box = createBox(initState());
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
      box.update(box(), initState());
    },
    getters,
  };
}
