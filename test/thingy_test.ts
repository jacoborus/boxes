import { assertEquals } from "assert";
import { createThingy, watchThing } from "../boxes.ts";

Deno.test({
  name: "basic thingy",
  fn() {
    const [get, set] = createThingy(1);
    assertEquals(get(), 1);
    let control = 0;
    const off = watchThing(get, (value) => {
      control = value;
    });
    let result = set(4);
    assertEquals(get(), 4, "update works");
    assertEquals(control, 4, "watch works");
    assertEquals(result, 4, "set returns value");
    off();
    result = set(6);
    assertEquals(control, 4, "off works");
    assertEquals(get(), 6, "update 2 works");
    assertEquals(result, 6, "set returns value");
  },
});
