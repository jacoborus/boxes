import { assertEquals } from "assert";
import { watchFn } from "../reactive.ts";
import { createThingy } from "../boxes.ts";

Deno.test({
  name: "watchFn with 1 thing",
  fn() {
    let control = 0;
    const [getThing, setThing] = createThingy(1);
    const off = watchFn(() => getThing() + 1, (value) => {
      control = value;
    });

    assertEquals(control, 0);
    setThing(2);
    assertEquals(control, 3);
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
