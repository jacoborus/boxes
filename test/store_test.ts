import { assertEquals } from "assert";
import { createStore } from "../src/store.ts";
// import { watch } from "../src/reactive.ts";

// Deno.test({
//   name: "Store getters",
//   fn() {
//     const store = createStore(
//       () => ({ hi: "hola", num: 2 }),
//       {
//         sayHi(state) {
//           return state.hi + " Mundo";
//         },
//         greetings(state, getters) {
//           getters.sayHi() === 5;
//           return getters.sayHi() + "!" + state.num;
//         },
//       },
//       // actions: {},
//     );
//     store.state.hi === 5;
//     store.state.asdfasdf === 5;
//     store.getters.sayHi() === 5;
//     store.getters.sayHi() === "asdf";
//     assertEquals(store.state.hi, "hola");
//     assertEquals(store.getters.sayHi(), "hola Mundo");
//     assertEquals(store.getters.greetings(), "hola Mundo!2");
//   },
// });

// Deno.test({
//   name: "Store actions",
//   fn() {
//     const store = createStore(
//       {
//         state: (): {
//           name: string;
//           age?: number;
//           member?: boolean;
//         } => ({ name: "boxes" }),
//         actions: {
//           changeName(state, actions) {
//             return actions.sayHi();
//           },
//           otherAction(state, actions) {
//             actions.fasdfasdf;
//             return actions.sayHi();
//           },
//         },
//         getters: {
//           sayHi(state) {
//             return "Hi " + state.name;
//           },
//           greetings(state, getters) {
//             return getters.sayHi() +
//               `! you are ${!state.member ? "not" : ""} a member`;
//           },
//         },
//       },
//     );
//
//     assertEquals(store.state.name, "boxes");
//     assertEquals(store.getters.sayHi(), "Hi boxes");
//     assertEquals(store.getters.greetings(), "Hi boxes! you are not a member");
//   },
// });
