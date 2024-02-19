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

Deno.test({
  name: "remove last",
  fn() {
    const box = createBox([1, 2, 3, 4, 5, 6, 7, 8]);
    const data = box();
    let control = 0 as number | undefined;
    let count = 0;
    const off = watchProp(data, 6, (value) => {
      count++;
      control = value;
    });
    box.remove(data);
    assertEquals(data, [1, 2, 3, 4, 5, 6, 7], "remove last item 1");
    assertEquals(control, 0, "does not trigger on previous items ");
    assertEquals(count, 0);
    box.remove(data);
    assertEquals(data, [1, 2, 3, 4, 5, 6], "remove item");
    assertEquals(control, undefined);
    assertEquals(count, 1);
    off();
    box.remove(data);
    assertEquals(data, [1, 2, 3, 4, 5], "remove last item");
    assertEquals(control, undefined);
    assertEquals(count, 1);
  },
});

Deno.test({
  name: "remove more",
  fn() {
    const box = createBox([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const data = box();
    let control = 0;
    const off = watchProp(data, 2, (value) => {
      control = value;
    });
    const result = box.remove(data, 3, 3);
    assertEquals(data, [1, 2, 3, 7, 8, 9, 10], "remove items");
    assertEquals(result, [4, 5, 6], "remove items result");
    assertEquals(control, 0, "does not trigger on previous items ");
    box.remove(data, 1, 2);
    assertEquals(data, [1, 7, 8, 9, 10], "remove item");
    assertEquals(control, 8);
    off();
    box.remove(data, 0, 2);
    assertEquals(data, [8, 9, 10], "remove item");
    assertEquals(control, 8);
  },
});
