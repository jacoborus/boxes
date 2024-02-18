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
  name: "foreach",
  fn() {
    const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const box = createBox(arr);
    const data = box();
    let control = 0;
    const off = watchProp(data[0], "a", (value) => {
      control = value;
    });
    box().forEach((item, i) => {
      const same = item === box()[i];
      assertEquals(same, true);
    });
    box.update(data[0], { a: 99 });
    assertEquals(control, 99, "dfasd");
    assertEquals(box()[0].a, 99);
    off();
    box.update(box()[0], { a: 22 });
    assertEquals(control, 99);
  },
});

// Deno.test("insert one", () => {
//   const arr = [1, 2, 3];
//   const box = createBox(arr);
//   const data = box();
//   let control = 0;
//   const off = watch(data, () => {
//     ++control;
//   });
//   box.insert(data, 5);
//   assertEquals(control, 1);
//   assertEquals(data.length, 4, "data length");
//   assertEquals(data[3], 5, "pushed item");
//   off();
//   box.insert(data, 4, 3);
//   assertEquals(control, 1);
//   assertEquals(data[3], 4);
// });
//
// Deno.test("insert many", () => {
//   const arr = [1, 2, 3];
//   const box = createBox(arr);
//   const data = box();
//   let control = 0;
//   const off = watch(data, () => {
//     ++control;
//   });
//   box.insert(data, [6, 7]);
//   assertEquals(control, 1);
//   assertEquals(data.length, 5);
//   assertEquals(data[3], 6);
//   assertEquals(data[4], 7);
//   off();
//   box.insert(data, [4, 5], 3);
//   assertEquals(control, 1);
//   assertEquals(data[3], 4);
//   assertEquals(data[4], 5);
// });
//
// Deno.test("remove", () => {
//   const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//   const box = createBox(arr);
//   const data = box();
//   let control = 0;
//   const off = watch(data, () => {
//     ++control;
//   });
//   box.remove(data, 1, 3);
//   assertEquals(control, 1);
//   assertEquals(data.length, 6);
//   assertEquals(data[1], 5);
//   off();
//   box.remove(data, 0);
//   assertEquals(control, 1);
//   assertEquals(data[0], 5);
// });
