import { assertEquals } from "assert";
import { createThing, watch } from "../boxes.ts";

Deno.test({
  name: "basic thing",
  fn() {
    const [thing, setThing] = createThing(1);
    assertEquals(thing(), 1);
    let control = 0;
    const off = watch(thing, () => {
      ++control;
    });
    setThing(4);
    assertEquals(control, 1, "watch");
    assertEquals(thing(), 4, "set");
    off();
    setThing(6);
    assertEquals(control, 1, "watch.off");
    assertEquals(thing(), 6, "second set");
  },
});
