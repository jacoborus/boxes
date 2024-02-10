import { assertEquals } from "assert";
import { createBox } from "../boxes.ts";
import { watchProp } from "../src/reactive.ts";

Deno.test({
  name: "basic update",
  fn() {
    const obj = { a: 1 };
    const box = createBox(obj);
    const data = box();
    let control = 0;
    const off = watchProp(data, "a", (value) => {
      control = value;
    });
    box.update(data, { a: 4 });
    assertEquals(data.a, 4, "update works");
    assertEquals(control, 4, "watch works");
    off();
    box.update(data, { a: 6 });
    assertEquals(control, 4);
  },
});
