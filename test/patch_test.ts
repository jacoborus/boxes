import { assertEquals } from "assert";
import { createBox } from "../boxes.ts";
import { watchProp } from "../src/reactive.ts";

Deno.test({
  name: "basic test",
  fn() {
    const obj = { a: 1 };
    const box = createBox(obj);
    let control = 0;
    assertEquals(box().a, obj.a, "copy works");
    const off = watchProp(box(), "a", (value) => {
      control = value;
    });
    box.patch(box(), { a: 4 });
    assertEquals(box().a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    box.update(box(), { a: 6 });
    assertEquals(control, 4);
  },
});

Deno.test({
  name: "patchMethod",
  fn() {
    const obj = { a: 1, b: "abc" };
    const box = createBox(obj);
    const data = box();
    assertEquals(box().a, obj.a);
    let control = 0;
    const off = watchProp(data, "a", (value) => {
      control = value;
    });
    box.patch(data, { a: 2 });
    assertEquals(control, 2);
    assertEquals(data.a, 2);
    assertEquals(data.b, "abc");
    assertEquals(control, 2);
    off();
    box.patch(data, { a: 6 });
    assertEquals(control, 2);
    assertEquals(data.a, 6);
  },
});

Deno.test({
  name: "patch with null",
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
    box.patch(data, { a: 2, b: null });
    assertEquals(data.a, 2);
    assertEquals(data.b, undefined);
  },
});

// Deno.test("patch deep", () => {
//   const obj = { o: { x: 1, y: 2 } };
//   const box = createBox(obj);
//   let control = 0;
//   const off = watch(box().o, () => {
//     ++control;
//   });
//   box.patch(box().o, { x: 99 });
//   assertEquals(control, 1);
//   assertEquals(box().o.x, 99);
//   assertEquals(box().o.y, 2);
//   off();
//   box.patch(box().o, { x: 6 });
//   assertEquals(control, 1);
//   assertEquals(box().o.x, 6);
//   assertEquals(box().o.y, 2);
// });
