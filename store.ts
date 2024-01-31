import type { Dict, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

type MyFn<S extends Dict, F extends (s: ReadonlyBasic<S>) => unknown> = () =>
  ReturnType<F>;

type GetterFactory<S extends Dict> = (state: ReadonlyBasic<S>) => unknown;

type GettersConfig<S extends Dict> = { [K: string]: GetterFactory<S> };

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
    [K in keyof typeof config.getters]: MyFn<
      S,
      (s: ReadonlyBasic<S>) => unknown
    >;
  };

  for (const i in config.getters) {
    const getterFactory = config.getters[i];
    getters[i] = () => getterFactory(state);
  }

  return {
    state,
    $reset() {
      box.update(box(), config.state());
    },
    getters: getters as {
      [K in keyof typeof config.getters]: MyFn<
        S,
        typeof config.getters[K]
      >;
    },
  };
}
