import { assertEquals } from "assert";
import { createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "Update simple object",
  fn() {
    const obj = { a: 1 };
    const [box, setBox] = createBox(obj);
    let control = 0;
    const off = watchProp(box, "a", (value) => {
      control = value;
    });
    setBox.update({ a: 4 });
    assertEquals(box.a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    setBox.update({ a: 6 });
    assertEquals(control, 4);
  },
});

Deno.test({
  name: "Update object",
  fn() {
    const obj = { a: 1, b: "abc", o: { x: "x", y: "y" } };
    const [box, setBox] = createBox<{
      a: number;
      b?: string;
      o: { x: string; y: string };
    }>(obj);
    let control = 0;
    const off = watchProp(box, "a", (value) => {
      control = value;
    });
    setBox.update({ a: 4, o: { x: "z", y: "z" } });
    assertEquals(box.a, 4, "update works");
    assertEquals(box.b, undefined, "update works");
    assertEquals(box.o.x, "z", "update works");
    assertEquals(control, 4, "watch works");
    off();
    setBox.update({ a: 6, o: { x: "hola", y: "z" } });
    assertEquals(control, 4);
  },
});

// Deno.test({
//   name: "Update deep",
//   fn() {
//     const obj = { a: 1, b: "abc", o: { x: "x", y: "y" } };
//     const box = createBox<{
//       a: number;
//       b?: string;
//       o: { x: string; y: string };
//     }>(obj);
//     const data = box();
//     let control = "";
//     const off = watchProp(data.o, "x", (value) => {
//       control = value;
//     });
//     box.update({ a: 1, b: "abc", o: { x: "z", y: "z" } });
//     assertEquals(data.a, 1, "update works");
//     assertEquals(data.b, "abc", "update works");
//     assertEquals(data.o.x, "z", "update works");
//     assertEquals(control, "z", "watch works");
//     off();
//     box.update({ a: 6, o: { x: "hola", y: "z" } });
//     assertEquals(control, "z");
//   },
// });

Deno.test({
  name: "Update just with payload",
  fn() {
    const obj = { a: 1 };
    const [box, setBox] = createBox(obj);
    let control = 0;
    const off = watchProp(box, "a", (value) => {
      control = value;
    });
    setBox.update({ a: 4 });
    assertEquals(box.a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    setBox.update({ a: 6 });
    assertEquals(control, 4);
  },
});
