import { assertEquals } from "assert";
import { createBox, createThingy, watch, watchFn } from "../boxes.ts";

Deno.test({
  name: "basic watchFn",
  fn() {
    let control = 0;
    const [getThing, setThing] = createThingy(1);
    const box = createBox({ a: 99 });
    const data = box();
    watchFn(() => getThing() + data.a, (value) => {
      control = value;
    });

    assertEquals(control, 0);
    setThing(2);
    assertEquals(control, 101);
    setThing(3);
    assertEquals(control, 102);
    box.update(data, { a: 200 });
    assertEquals(control, 203);
    // const off = watch(box(), () => {
    //   ++control;
    // });
    // box.update(box(), { a: 4 });
    // assertEquals(control, 1, "watch works");
    // assertEquals(box().a, 4, "update works");
    // off();
    // box.update(box(), { a: 6 });
    // assertEquals(control, 1);
  },
});
