import { assertEquals } from "assert";
import { createStore } from "../store.ts";
// import { watch } from "../boxes.ts";

Deno.test({
  name: "Store getters",
  fn() {
    const { state, getters } = createStore(
      () => ({ hi: "hola", num: 2 }),
      {
        sayHi(state) {
          return state.hi + " Mundo";
        },
        greetings(state, getters) {
          return getters.sayHi() + "!" + state.num;
        },
      },
    );

    // state.hi === 5;
    // state.asdfasdf === 5;
    // getters.sayHi() === 5;
    getters.sayHi() === "asdf";
    assertEquals(state.hi, "hola");
    assertEquals(getters.sayHi(), "hola Mundo");
    assertEquals(getters.greetings(), "hola Mundo!2");
  },
});

Deno.test({
  name: "Store actions",
  fn() {
    const { state, getters, actions } = createStore(
      (): {
        name: string;
        age?: number;
        member?: boolean;
      } => ({ name: "boxes" }),
      {
        sayHi(state) {
          return "Hi " + state.name;
        },
        greetings(state, getters) {
          return getters.sayHi() +
            `!, you are ${state.member ? "not" : ""} a member`;
        },
      },
      {
        changeName(box) {},
      },
    );

    assertEquals(state.name, "boxes");
    assertEquals(getters.sayHi(), "Hi boxes");
    assertEquals(getters.greetings(), "Hi boxes! you are not a member");
  },
});
