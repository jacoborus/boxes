import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";

import { assign, computed, getBox, on } from "./boxes.ts";

Deno.test("basic proxy", () => {
  const obj = { a: 1, b: { c: 99 } };
  const box = getBox(obj);
  assertEquals(box.a, 1);
  assertEquals(box.b.c, 99);
  assertEquals(box.b, { c: 99 });
});

Deno.test("basic proxy array", () => {
  const arr = ["a", "b", 3, 4, { a: 99 }] as const;
  const box = getBox(arr);
  assertEquals(box[0], "a");
  assertEquals(box[1], "b");
  assertEquals(box[2], 3);
  assertEquals(box[4].a, 99);
});

Deno.test("weird proxy array", () => {
  const obj = getBox({ a: 99 });
  const arr = ["a", "b", 3, 4, obj, [66]] as const;
  const box = getBox(arr);
  assertEquals(box[0], "a");
  assertEquals(box[1], "b");
  assertEquals(box[2], 3);
  assertEquals(box[4].a, 99);
  assertEquals(box[5][0], 66);
});

Deno.test("Reactiveness", () => {
  const obj = { a: 99 };
  const box = getBox(obj);
  let control = 0;
  on(box, () => {
    control = 1;
  });
  assign(box, { a: 66 });
  assertEquals(box.a, 66);
  assertEquals(control, 1);
});

Deno.test("Reactiveness recursive", () => {
  const obj = getBox({ a: 99 });
  const box = getBox(obj);
  let control = 0;
  on(box, () => {
    control = 1;
  });
  assign(box, { a: 66 });
  assertEquals(box.a, 66);
  assertEquals(control, 1);
});

Deno.test("Pass target type to handler of computed", () => {
  interface Obj {
    a: number;
    b?: string;
  }
  const obj = { a: 99 } as Obj;
  const box = getBox(obj);
  let control = 0;
  on(box, (value) => {
    control = value.a;
    console.log(value.b);
  });
  assign(box, { a: 66, b: "string" });
  assertEquals(box.a, 66);
  assertEquals(control, 66);
});

Deno.test("computed", () => {
  const obj = { b: 55 };
  const box = getBox(obj);
  let control = 0;
  const myComputed = computed(() => box.b);
  myComputed.on((value: number) => {
    control = value;
  });
  assign(box, { b: 1 });
  assertEquals(myComputed.value, 1);
  assertEquals(control, 1);
});
