import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { getBox, watch } from "./boxes.ts";

Deno.test("basic test", () => {
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

Deno.test("deep binding", () => {
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

Deno.test("patchMethod", () => {
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

Deno.test("patch with null", () => {
  type Target = {
    a: number;
    b?: string;
  };
  const obj = { a: 1, b: "abc" } as Target;
  const box = getBox(obj);
  assertEquals(box().a, obj.a);
  assertEquals(box().b, obj.b);
  box.patch(box(), { a: 2, b: null });
  assertEquals(box().a, obj.a);
  assertEquals(box().b, undefined);
});

Deno.test("patch deep", () => {
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

Deno.test("update", () => {
  const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];
  const box = getBox(arr);
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
  const box = getBox(arr);
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

Deno.test("fill", () => {
  const arr = [1, 2, 3];
  const box = getBox(arr);
  const data = box();
  let control = 0;
  watch(data, () => {
    ++control;
  });
  const result = box.fill(data, 4);
  result.toReversed;
  assertEquals(control, 1);
  assertEquals(result, [4, 4, 4]);
  assertEquals(true, result === data);
});

Deno.test("pop", () => {
  const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
  const box = getBox(arr);
  const data = box();
  let control = 0;
  watch(data, () => {
    ++control;
  });
  const result = box.pop(data);
  assertEquals(control, 1);
  assertEquals(result.x, 3);
  assertEquals(data, [{ x: 1 }, { x: 2 }]);
});

Deno.test("push", () => {
  const arr = [1, 2, 3];
  const box = getBox(arr);
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

Deno.test("shift", () => {
  const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
  const box = getBox(arr);
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

Deno.test("sort simple", () => {
  const arr = [4, 3, 1, 2];
  const box = getBox(arr);
  const data = box();
  let control = 0;
  watch(data, () => {
    ++control;
  });
  const result = box.sort(data);
  assertEquals(control, 1);
  assertEquals(data, result);
  assertEquals(data, [1, 2, 3, 4]);
});

Deno.test("unshift", () => {
  const arr = [1, 2, 3];
  const box = getBox(arr);
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
