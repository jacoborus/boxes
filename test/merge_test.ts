import { assertEquals } from "assert";
import { createBox } from "../boxes.ts";
import { watchProp } from "../src/reactive.ts";

Deno.test({
  name: "basic merge",
  fn() {
    const obj = { a: 1 };
    const box = createBox(obj);
    let control = 0;
    assertEquals(box().a, obj.a, "copy works");
    const off = watchProp(box(), "a", (value) => {
      control = value;
    });
    box.merge({ a: 4 });
    assertEquals(box().a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    box.update({ a: 6 });
    assertEquals(control, 4);
  },
});

Deno.test({
  name: "mergeMethod",
  fn() {
    const obj = { a: 1, b: "abc" };
    const box = createBox(obj);
    const data = box();
    assertEquals(box().a, obj.a);
    let control = 0;
    const off = watchProp(data, "a", (value) => {
      control = value;
    });
    box.merge({ a: 2 });
    assertEquals(control, 2, "watch works");
    assertEquals(data.a, 2);
    assertEquals(data.b, "abc");
    assertEquals(control, 2);
    off();
    box.merge({ a: 6 });
    assertEquals(control, 2);
    assertEquals(data.a, 6);
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
    const box = createBox<Target>(obj);
    const data = box();
    assertEquals(data.a, obj.a);
    assertEquals(data.b, obj.b);
    box.merge({ a: 2, b: null });
    assertEquals(data.a, 2);
    assertEquals(data.b, undefined);
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
    const box = createBox(obj);
    let control = 0;
    assertEquals(box().a, obj.a, "copy works");
    const off = watchProp(box(), "a", (value) => {
      control = value;
    });
    box.merge({ a: 4 });
    assertEquals(box().a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    box.merge({ a: 6 });
    assertEquals(control, 4);
  },
});
