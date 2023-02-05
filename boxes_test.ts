import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { getBox, watch } from "./boxes.ts";

Deno.test(function basicTest() {
  const obj = { a: 1 };
  const box = getBox(obj);
  let control = 0;
  assertEquals(box().a, obj.a);
  const off = watch(box(), () => {
    ++control;
  });
  box.update(box(), { a: 4 });
  assertEquals(control, 1);
  assertEquals(box().a, obj.a);
  assertEquals(box().a, 4);
  off();
  box.update(box(), { a: 6 });
  assertEquals(control, 1);
});

Deno.test(function deepBinding() {
  const obj = { a: 1, o: { x: 1 } };
  const box = getBox(obj);
  const data = box();
  assertEquals(data.o, obj.o);
  let control = 0;
  const off = watch(box().o, () => {
    ++control;
  });
  box.update(data.o, { x: 42 });
  assertEquals(control, 1);
  assertEquals(data.o.x, obj.o.x);
  off();
  box.update(box(), { a: 6, o: { x: 1 } });
  assertEquals(control, 1);
});

Deno.test(function patchMethod() {
  const obj = { a: 1, b: "abc" };
  const box = getBox(obj);
  assertEquals(box().a, obj.a);
  let control = 0;
  const off = watch(box(), () => {
    ++control;
  });
  box.patch(box(), { a: 2 });
  assertEquals(control, 1);
  assertEquals(box().a, obj.a);
  assertEquals(box().a, 2);
  assertEquals(box().b, "abc");
  off();
  box.patch(box(), { a: 6 });
  assertEquals(control, 1);
});

Deno.test(function patchMethodDeep() {
  const obj = { o: { x: 1, y: 2 } };
  const box = getBox(obj);
  let control = 0;
  const off = watch(box().o, () => {
    ++control;
  });
  box.patch(box().o, { x: 99 });
  assertEquals(control, 1);
  assertEquals(box().o, obj.o);
  assertEquals(box().o.x, 99);
  assertEquals(box().o.y, 2);
  off();
  box.patch(box().o, { x: 6 });
  assertEquals(control, 1);
});

Deno.test(function deepPatch() {
  const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
  const box = getBox(arr);
  let control = 0;
  const off = watch(box()[0], () => {
    ++control;
  });
  // console.log(box[0] === arr[0]);
  box.update(box()[0], { a: 99 });
  assertEquals(control, 1);
  assertEquals(box()[0].a, 99);
  off();
  box.update(box()[0], { a: 22 });
  assertEquals(control, 1);
});

Deno.test(function foreachBox() {
  const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
  const box = getBox(arr);
  let control = 0;
  const off = watch(box()[0], () => {
    ++control;
  });
  box().forEach((item, i) => {
    const same = item === box()[i];
    assertEquals(same, true);
  });
  // console.log(box[0] === arr[0]);
  box.update(box()[0], { a: 99 });
  assertEquals(control, 1);
  assertEquals(box()[0].a, 99);
  off();
  box.update(box()[0], { a: 22 });
  assertEquals(control, 1);
});
