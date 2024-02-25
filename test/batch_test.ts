import { assertEquals } from "assert";
import { batch, createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "batch",
  fn() {
    const box = createBox({ a: 1 });
    const data = box();
    let count = 0;
    const off = watchProp(data, "a", () => {
      count++;
    });
    batch(() => {
      box.update({ a: 4 });
      box.update({ a: 6 });
      box.merge({ a: 9 });
    });
    assertEquals(count, 1, "batch works");
    box.update({ a: 88 });
    assertEquals(count, 2);
    off();
    box.update({ a: 6 });
    assertEquals(count, 2);
  },
});
