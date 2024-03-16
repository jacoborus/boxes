import { assertEquals, assertThrows } from "assert";
import { createBox } from "../boxes.ts";
import { watchProp } from "../src/reactivity.ts";

Deno.test({
  name: "basic test",
  fn() {
    const obj = { a: 1 };
    const [box, setBox] = createBox(obj);
    let control = 0;
    assertEquals(box.a, obj.a, "copy works");
    const off = watchProp(box, "a", (value) => {
      control = value;
    });
    setBox.merge({ a: 4 });
    assertEquals(box.a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    setBox.update({ a: 6 });
    assertEquals(control, 4);
  },
});

// Deno.test({
//   name: "foreach",
//   fn() {
//     const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
//     const box = createBox(arr);
//     const data = box();
//     let control = 0;
//     const off = watchProp(data[0], "a", (value) => {
//       control = value;
//     });
//     box().forEach((item, i) => {
//       const same = item === box()[i];
//       assertEquals(same, true);
//     });
//     box.update(data[0], { a: 99 });
//     assertEquals(control, 99, "dfasd");
//     assertEquals(box()[0].a, 99);
//     off();
//     box.update(box()[0], { a: 22 });
//     assertEquals(control, 99);
//   },
// });

// Deno.test({
//   name: "ownership",
//   fn() {
//     const box = createBox<{ a?: number; o: { x: number } }>({
//       a: 1,
//       o: { x: 2 },
//     });
//     const caja = createBox({ x: 99 });
//     const data = box();
//     box.update({ a: 2, o: caja() });
//     assertEquals(data.o, caja());
//     assertThrows(() => {
//       box.merge({ x: 3 });
//     });
//   },
// });
