import type { Dict, ReadonlyBasic } from "./boxes.ts";
import { createBox } from "./boxes.ts";

type GettersConfig<S extends Dict> = Record<
  string,
  (state: ReadonlyBasic<S>, getters: Getters<S, GettersConfig<S>>) => unknown
>;

type GetterFn<
  S extends Dict,
  G extends GettersConfig<S>,
  K extends keyof G,
> = () => ReturnType<G[K]>;

type Getters<S extends Dict, G extends GettersConfig<S>> = {
  [K in keyof G]: GetterFn<S, G, K>;
};

type ActionsConfig<S extends Dict, G extends GettersConfig<S>> = Record<
  string,
  (
    state: ReadonlyBasic<S>,
    getters: Getters<S, G>,
    actions: Actions<S, G, ActionsConfig<S, G>>,
  ) => unknown
>;

type Actions<
  S extends Dict,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
> = {
  [K in keyof A]: ActionFn<S, G, A, K>;
};

type ActionFn<
  S extends Dict,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
  K extends keyof A,
> = () => ReturnType<A[K]>;

export function createStore<
  S extends Dict,
  G extends GettersConfig<S>,
  A extends ActionsConfig<S, G>,
>(
  initState = (() => {}) as () => S,
  gettersConfig: G | null,
  actionsConfig?: A,
) {
  gettersConfig = gettersConfig || {} as G;
  actionsConfig = actionsConfig || {} as A;

  const box = createBox(initState());
  const state = box();

  const getters = {} as Getters<S, G>;

  for (const i in gettersConfig) {
    const getterFactory = gettersConfig[i];
    getters[i] = function () {
      return getterFactory(state, getters);
    } as GetterFn<S, G, typeof i>;
  }

  const actions = {} as Actions<S, G, A>;

  for (const i in actionsConfig) {
    const actionFactory = actionsConfig[i];
    actions[i] = function () {
      return actionFactory(state, getters, actions);
    } as ActionFn<S, G, A, typeof i>;
  }

  return {
    state,
    $reset() {
      box.update(box(), initState());
    },
    getters,
    actions,
  };
}
