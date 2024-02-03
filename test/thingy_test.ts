import { assertEquals } from "assert";
import { createThingy, watch } from "../thingy.ts";

Deno.test({
  name: "basic thingy",
  fn() {
    const [get, set] = createThingy(1);
    assertEquals(get(), 1);
    let control = 0;
    const off = watch(get, () => {
      ++control;
    });
    set(4);
    assertEquals(control, 1, "watch works");
    assertEquals(get(), 4, "update works");
    off();
    set(6);
    assertEquals(control, 1, "off works");
    assertEquals(get(), 6, "update 2 works");
  },
});
