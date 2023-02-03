import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { getBox, watch } from "./boxes.ts";

Deno.test(function basicTest() {
  const obj = { a: 1 };
  const box = getBox(obj);
  const data = box.data;
  let control = 0;
  assertEquals(data.a, obj.a);
  const off = watch(data, () => {
    ++control;
  });
  box.update(data, { a: 4 });
  assertEquals(control, 1);
  assertEquals(data.a, obj.a);
  assertEquals(data.a, 4);
  off();
  box.update(data, { a: 6 });
  assertEquals(control, 1);
});

Deno.test(function deepBinding() {
  const obj = { a: 1, o: { x: 1 } };
  const box = getBox(obj);
  const data = box.data;
  assertEquals(data.o, obj.o);
  let control = 0;
  const off = watch(data.o, () => {
    ++control;
  });
  box.update(data.o, { x: 42 });
  assertEquals(control, 1);
  assertEquals(data.o.x, obj.o.x);
  off();
  box.update(data, { a: 6, o: { x: 1 } });
  assertEquals(control, 1);
});
