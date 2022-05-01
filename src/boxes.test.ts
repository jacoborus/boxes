import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { computed, getBox, off, on, watchEffect } from "./boxes.ts";

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
  box.a = 66;
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
  box.a = 66;
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
  let control = "";
  on(box, (value) => {
    if (value.b) {
      control = value.b;
    }
  });
  box.b = "str";
  assertEquals(box.a, 99);
  assertEquals(control, "str");
});

Deno.test("Reactiveness deep", () => {
  const obj = { a: 99, b: { c: 1 } };
  const box = getBox(obj);
  let control = 0;
  on(box, () => {
    control = 1;
  });
  box.a = 66;
  box.b.c = 4;
  assertEquals(box.b.c, 4);
  assertEquals(control, 1);
});

Deno.test("Off Reactive", () => {
  const obj = { a: 99, b: { c: 1 } };
  const box = getBox(obj);
  let control = 0;
  const handler = () => {
    control = 1;
  };
  on(box, handler);
  box.a = 66;
  box.b.c = 4;
  assertEquals(box.b.c, 4);
  assertEquals(control, 1);
  off(box, handler);
  box.b.c = 5;
  assertEquals(box.b.c, 5);
  assertEquals(control, 1);
});

Deno.test("computed.on", () => {
  const obj = { b: 55 };
  const box = getBox(obj);
  let control = 0;
  const myComputed = computed(() => box.b);
  on(myComputed, (compu: { value: number }) => {
    control = compu.value;
  });
  box.b = 1;
  assertEquals(myComputed.value, 1);
  assertEquals(control, 1);
});

Deno.test("computed.off", () => {
  const obj = { b: 55 };
  const box = getBox(obj);
  let control = 0;
  const myComputed = computed(() => box.b);
  const handler = (compu: { value: number }) => {
    control = compu.value;
  };
  on(myComputed, handler);
  box.b = 1;
  assertEquals(myComputed.value, 1);
  assertEquals(control, 1);
  off(myComputed, handler);
  box.b = 4;
  assertEquals(myComputed.value, 4);
  assertEquals(control, 1);
});

Deno.test("watchEffect", () => {
  const obj = { b: 55 };
  const box = getBox(obj);
  let control = 0;
  const stop = watchEffect(() => control = box.b);
  box.b = 1;
  assertEquals(control, 1);
  box.b = 3;
  assertEquals(control, 3);
  stop();
  box.b = 4;
  assertEquals(control, 3);
});
