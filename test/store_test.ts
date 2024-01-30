import { assertEquals } from "assert";
import { createStore } from "../store.ts";
import { watch } from "../boxes.ts";

Deno.test({
  name: "basic store",
  fn() {
    const { state, getters, actions } = createStore({
      state: () => ({ hi: "hola" }),
      getters: {
        sayHi: (state) => state.hi + " Mundo",
      },
      actions: {},
    });
    assertEquals(state.hi, "hola");
    assertEquals(getters.sayHi(), "hola Mundo");
    let control = 0;
    const off = watch(state, () => {
      ++control;
    });
    // setThing(4);
    // assertEquals(control, 1, "watch");
    // assertEquals(thing(), 4, "set");
    // off();
    // setThing(6);
    // assertEquals(control, 1, "watch.off");
    // assertEquals(thing(), 6, "second set");
  },
});
