import type { Basic, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

type Getters<S extends Basic, G extends GettersConfig<S>> = {
  [K in keyof G]: () => ReturnType<G[K]>;
};

type GettersConfig<S extends Basic> = {
  [key: string]: <R>(
    state: ReadonlyBasic<S>,
    getters: Getters<S, GettersConfig<S>>,
  ) => R;
};

type Actions<
  S extends Basic,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
> = {
  [key: string]: <R>(
    state: ReadonlyBasic<S>,
    getters: Getters<S, G>,
    actions: Actions<S, G, A>,
  ) => R;
};

type ActionsConfig<S extends Basic, G extends GettersConfig<S>> = {
  [key: string]: <R>(
    state: ReadonlyBasic<S>,
    getters: Getters<S, G>,
    actions: Actions<S, G, ActionsConfig<S, G>>,
  ) => R;
};

type StoreConfig<
  S extends Basic,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
> = {
  state: () => S;
  getters?: G;
  actions?: A;
};

export function createStore<
  S extends Basic,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
>(config: StoreConfig<S, G, A>) {
  const box = createBox(config.state());

  const configGetters = config.getters;
  const configActions = config.actions;

  const getters = {} as unknown as Getters<S, G>;
  if (configGetters) {
    for (const i in configGetters) {
      const getter = configGetters[i];
      getters[i] = () => getter(box(), getters);
    }
  }

  const actions = {} as unknown as Actions<S, G, A>;
  if (configActions) {
    for (const i in configActions) {
      const action = configActions[i];
      actions[i] = () => action(box(), getters, actions);
    }
  }

  return {
    get state() {
      return box();
    },
    reset() {
      box.update(box(), config.state());
    },
    getters,
    actions,
  };
}
