import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { createBox, watch } from "./boxes.ts";

Deno.test({
  name: "basic test",
  fn() {
    const obj = { a: 1 };
    const box = createBox(obj);
    let control = 0;
    assertEquals(box().a, obj.a, "copy works");
    const off = watch(box(), () => {
      ++control;
    });
    box.update(box(), { a: 4 });
    assertEquals(control, 1, "watch works");
    assertEquals(box().a, 4, "update works");
    off();
    box.update(box(), { a: 6 });
    assertEquals(control, 1);
  },
});

Deno.test({
  name: "deep binding",
  fn() {
    const obj = { a: 1, o: { x: 1 } };
    const box = createBox(obj);
    const data = box();
    assertEquals(data.o, obj.o);
    let control = 0;
    const off = watch(box().o, () => {
      ++control;
    });
    box.update(data.o, { x: 42 });
    assertEquals(control, 1);
    assertEquals(data.o.x, 42);
    off();
    box.update(box(), { a: 6, o: { x: 1 } });
    assertEquals(control, 1, "asdfsa");
    assertEquals(data.a, 6);
    assertEquals(data.o.x, 1);
  },
});

Deno.test({
  name: "patchMethod",
  fn() {
    const obj = { a: 1, b: "abc" };
    const box = createBox(obj);
    assertEquals(box().a, obj.a);
    let control = 0;
    const off = watch(box(), () => {
      ++control;
    });
    box.patch(box(), { a: 2 });
    assertEquals(control, 1);
    assertEquals(box().a, 2);
    assertEquals(box().b, "abc");
    off();
    box.patch(box(), { a: 6 });
    assertEquals(control, 1);
    assertEquals(box().a, 6);
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
    assertEquals(box().a, obj.a);
    assertEquals(box().b, obj.b);
    box.patch(box(), { a: 2, b: null });
    assertEquals(box().a, 2);
    assertEquals(box().b, undefined);
  },
});

Deno.test("patch deep", () => {
  const obj = { o: { x: 1, y: 2 } };
  const box = createBox(obj);
  let control = 0;
  const off = watch(box().o, () => {
    ++control;
  });
  box.patch(box().o, { x: 99 });
  assertEquals(control, 1);
  assertEquals(box().o.x, 99);
  assertEquals(box().o.y, 2);
  off();
  box.patch(box().o, { x: 6 });
  assertEquals(control, 1);
});

Deno.test("update", () => {
  const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
  const box = createBox(arr);
  let control = 0;
  const off = watch(box()[0], () => {
    ++control;
  });
  box.update(box()[0], { a: 99 });
  assertEquals(control, 1);
  assertEquals(box()[0].a, 99);
  off();
  box.update(box()[0], { a: 22 });
  assertEquals(control, 1);
});

Deno.test("foreach", () => {
  const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
  const box = createBox(arr);
  let control = 0;
  const off = watch(box()[0], () => {
    ++control;
  });
  box().forEach((item, i) => {
    const same = item === box()[i];
    assertEquals(same, true);
  });
  box.update(box()[0], { a: 99 });
  assertEquals(control, 1);
  assertEquals(box()[0].a, 99);
  off();
  box.update(box()[0], { a: 22 });
  assertEquals(control, 1);
});

Deno.test("push", () => {
  const arr = [1, 2, 3];
  const box = createBox(arr);
  const data = box();
  let control = 0;
  const off = watch(data, () => {
    ++control;
  });
  const len = box.push(data, 4);
  assertEquals(control, 1);
  assertEquals(len, 4);
  assertEquals(data[3], 4);
  off();
  box.push(data, 6);
  assertEquals(control, 1);
});

Deno.test({
  name: "pop",
  fn() {
    const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const box = createBox(arr);
    const data = box();
    let control = 0;
    watch(data, () => {
      ++control;
    });
    const result = box.pop(data);
    assertEquals(control, 1);
    assertEquals(result.x, 3);
    assertEquals(data[0].x, 1);
    assertEquals(data[1].x, 2);
    assertEquals(data[2], undefined);
  },
});

Deno.test("shift", () => {
  const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
  const box = createBox(arr);
  const data = box();
  let control = 0;
  watch(data, () => {
    ++control;
  });
  const result = box.shift(data);
  assertEquals(control, 1);
  assertEquals(result.x, 1);
  assertEquals(data, [{ x: 2 }, { x: 3 }]);
});

Deno.test("unshift", () => {
  const arr = [1, 2, 3];
  const box = createBox(arr);
  const data = box();
  let control = 0;
  const off = watch(data, () => {
    ++control;
  });
  const len = box.unshift(data, 4);
  assertEquals(control, 1);
  assertEquals(len, 4);
  assertEquals(data[0], 4);
  off();
  box.unshift(data, 6);
  assertEquals(control, 1);
  assertEquals(data[0], 6);
});

// Deno.test("sort simple", () => {
//   const arr = [4, 3, 1, 2];
//   const box = createBox(arr);
//   const data = box();
//   let control = 0;
//   watch(data, () => {
//     ++control;
//   });
//   const result = box.sort(data);
//   assertEquals(control, 1);
//   assertEquals(data, result);
//   assertEquals(data, [1, 2, 3, 4]);
// });

Deno.test("insert", () => {
  const arr = [1, 2, 3];
  const box = createBox(arr);
  const data = box();
  let control = 0;
  const off = watch(data, () => {
    ++control;
  });
  box.insert(data, 1, 4);
  assertEquals(control, 1);
  assertEquals(data.length, 4);
  assertEquals(data[1], 4);
  off();
  box.insert(data, 2, 6);
  assertEquals(control, 1);
});

Deno.test("extract", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const box = createBox(arr);
  const data = box();
  let control = 0;
  const off = watch(data, () => {
    ++control;
  });
  const x = box.extract(data, 1, 3);
  assertEquals(x, [2, 3, 4]);
  assertEquals(control, 1);
  assertEquals(data.length, 6);
  assertEquals(data[1], 5);
  off();
  const y = box.extract(data, 0);
  assertEquals(y, [1]);
  assertEquals(control, 1);
  assertEquals(data[0], 5);
});
