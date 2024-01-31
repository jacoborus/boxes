import { assertEquals } from "assert";
import { createStore } from "../store.ts";
// import { watch } from "../boxes.ts";

Deno.test({
  name: "basic store",
  fn() {
    const { state, getters } = createStore({
      state: () => ({ hi: "hola", num: 2 }),
      getters: {
        sayHi(state) {
          return state.hi + " Mundo";
        },
        greetings(state, getters) {
          return getters.sayHi() + "!" + state.num;
        },
      },
    });

    // state.hi === 5;
    // state.asdfasdf === 5;
    // getters.sayHi() === 5;
    getters.sayHi() === "asdf";
    assertEquals(state.hi, "hola");
    assertEquals(getters.sayHi(), "hola Mundo");
    assertEquals(getters.greetings(), "hola Mundo!2");
  },
});
