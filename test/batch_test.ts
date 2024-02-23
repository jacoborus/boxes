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
      box.update(data, { a: 4 });
      box.update(data, { a: 6 });
      box.merge(data, { a: 9 });
    });
    assertEquals(count, 1, "batch works");
    box.update(data, { a: 88 });
    assertEquals(count, 2);
    off();
    box.update(data, { a: 6 });
    assertEquals(count, 2);
  },
});
