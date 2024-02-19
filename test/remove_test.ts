import { assertEquals } from "assert";
import { createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "remove one",
  fn() {
    const box = createBox([1, 2, 3, 4, 5, 6, 7, 8]);
    const data = box();
    let control = 0;
    const off = watchProp(data, 2, (value) => {
      control = value;
    });
    box.remove(data, 3);
    assertEquals(data, [1, 2, 3, 5, 6, 7, 8], "remove item");
    assertEquals(control, 0, "does not trigger on previous items ");
    box.remove(data, 1);
    assertEquals(data, [1, 3, 5, 6, 7, 8], "remove item");
    assertEquals(control, 5);
    off();
    box.remove(data, 0);
    assertEquals(data[0], 3);
    assertEquals(control, 5);
  },
});
