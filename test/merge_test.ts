import { assertEquals } from "assert";
import { createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "basic merge",
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

Deno.test({
  name: "mergeMethod",
  fn() {
    const obj = { a: 1, b: "abc" };
    const [box, setBox] = createBox(obj);
    assertEquals(box.a, obj.a);
    let control = 0;
    const off = watchProp(box, "a", (value) => {
      control = value;
    });
    setBox.merge({ a: 2 });
    assertEquals(control, 2, "watch works");
    assertEquals(box.a, 2);
    assertEquals(box.b, "abc");
    assertEquals(control, 2);
    off();
    setBox.merge({ a: 6 });
    assertEquals(control, 2);
    assertEquals(box.a, 6);
  },
});

Deno.test({
  name: "merge with null",
  fn() {
    type Target = {
      a: number;
      b?: string;
    };
    const obj = { a: 1, b: "abc" };
    const [box, setBox] = createBox(obj);
    assertEquals(box.a, obj.a);
    assertEquals(box.b, obj.b);
    setBox.merge({ a: 2, b: null });
    assertEquals(box.a, 2);
    assertEquals(box.b, undefined);
  },
});

// Deno.test("merge deep", () => {
//   const obj = { o: { x: 1, y: 2 } };
//   const box = createBox(obj);
//   const data = box();
//   let control = 0;
//   const off = watchProp(data.o, "x", (value) => {
//     control = value;
//   });
//   box.merge(data.o, { x: 99 });
//   assertEquals(control, 99);
//   assertEquals(data.o.x, 99);
//   assertEquals(data.o.y, 2);
//   off();
//   box.merge(data.o, { x: 6 });
//   assertEquals(control, 99);
//   assertEquals(data.o.x, 6);
//   assertEquals(data.o.y, 2);
// });

Deno.test({
  name: "merge just with payload",
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
    setBox.merge({ a: 6 });
    assertEquals(control, 4);
  },
});
