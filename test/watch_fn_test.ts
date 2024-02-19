import { assertEquals } from "assert";
import { watchFn } from "../src/reactive.ts";
import { createBox, createThingy } from "../boxes.ts";

Deno.test({
  name: "watchFn with 1 thing",
  fn() {
    let control = 0;
    const [getThing, setThing] = createThingy(1);
    const off = watchFn(() => getThing() + 1, (value) => {
      control = value;
    });
    assertEquals(control, 0);
    setThing(22);
    assertEquals(getThing(), 22);
    assertEquals(control, 23);
    setThing(3);
    assertEquals(control, 4);
    off();
    setThing(6);
    assertEquals(control, 4);
  },
});

Deno.test({
  name: "watchFn with 2 things",
  fn() {
    let control = 0;
    const [getThingOne, setThingOne] = createThingy(1);
    const [getThingTwo, setThingTwo] = createThingy(99);
    const off = watchFn(() => getThingOne() + getThingTwo(), (value) => {
      control = value;
    });

    assertEquals(control, 0);
    setThingOne(2);
    assertEquals(control, 101);
    setThingTwo(3);
    assertEquals(control, 5);
    off();
    setThingOne(6);
    assertEquals(control, 5);
  },
});

Deno.test({
  name: "watchFn + patch with 1 box",
  fn() {
    let control = 0;
    const box = createBox({ a: 1 });
    const data = box();
    const off = watchFn(() => data.a + 1, (value) => {
      control = value;
    });
    assertEquals(control, 0);
    box.patch(data, { a: 4 });
    assertEquals(data.a, 4);
    assertEquals(control, 5);
    box.patch(data, { a: 99 });
    assertEquals(control, 100);
    off();
    box.patch(data, { a: 1 });
    assertEquals(control, 100);
  },
});

Deno.test({
  name: "watchFn + patch with 1 box deep binding",
  fn() {
    let control = 0;
    let count = 0;
    const box = createBox<{
      a?: number;
      o: { x: number; y: number };
    }>({
      a: 1,
      o: { x: 1, y: 2 },
    });
    const data = box();
    const off = watchFn(() => data.o.x + 1, (value) => {
      count++;
      control = value;
    });
    assertEquals(control, 0);
    box.patch(data, { o: { x: 3 } });
    assertEquals(count, 1, "times listener has been triggered");
    assertEquals(data.o.x, 3);
    assertEquals(control, 4);
    box.patch(data, { o: { y: 99 } });
    assertEquals(control, 4);
    off();
    box.patch(data, { o: { x: 99 } });
    assertEquals(control, 4);
  },
});
