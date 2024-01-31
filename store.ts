import type { Dict, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

type GetterFn<S extends Dict, F extends (s: ReadonlyBasic<S>) => unknown> =
  () => ReturnType<F>;

type GetterFactory<S extends Dict> = (state: ReadonlyBasic<S>) => unknown;

type GettersConfig<S extends Dict> = Record<string, GetterFactory<S>>;

type StoreConfig<S extends Dict, G extends GettersConfig<S>> = {
  state: () => S;
  getters: G;
};

export function createStore<S extends Dict, G extends GettersConfig<S>>(
  config = { state: () => {}, getters: {} } as StoreConfig<S, G>,
) {
  const box = createBox(config.state());
  const state = box();

  const getters = {} as {
    [K in keyof typeof config.getters]: GetterFn<S, typeof config.getters[K]>;
  };

  for (const i in config.getters) {
    const getterFactory = config.getters[i];
    getters[i] = function () {
      return getterFactory(state);
    } as GetterFn<S, typeof config.getters[typeof i]>;
  }

  return {
    state,
    $reset() {
      box.update(box(), config.state());
    },
    getters,
  };
}
