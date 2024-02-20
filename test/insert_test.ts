import { assertEquals } from "assert";
import { createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "insert one at the end",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, 4);
    assertEquals(data, [1, 2, 3, 4], "insert item last position");
    assertEquals(control, 0, "does not trigger on previous items ");
    box.insert(data, 5);
    assertEquals(data, [1, 2, 3, 4, 5], "remove item last position");
    assertEquals(control, 0);
  },
});

Deno.test({
  name: "insert many at the end",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, [4, 5]);
    assertEquals(data, [1, 2, 3, 4, 5], "insert item last position");
    assertEquals(control, 0, "does not trigger on previous items ");
    box.insert(data, [6, 7]);
    assertEquals(data, [1, 2, 3, 4, 5, 6, 7], "remove item last position");
    assertEquals(control, 0);
  },
});

Deno.test({
  name: "insert one at the beginning",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    const off = watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, 4, 0);
    assertEquals(data, [4, 1, 2, 3], "insert item last position");
    assertEquals(control, 2, "triggers listener");
    box.insert(data, 5, 0);
    assertEquals(data, [5, 4, 1, 2, 3], "insert item last position 2");
    assertEquals(control, 1);
    off();
    box.insert(data, 6, 0);
    assertEquals(data, [6, 5, 4, 1, 2, 3], "insert item last position 2");
    assertEquals(control, 1);
  },
});

Deno.test({
  name: "insert many at the beginning",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    const off = watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, [-1, 0], 0);
    assertEquals(data, [-1, 0, 1, 2, 3], "insert item last position");
    assertEquals(control, 1, "triggers listener");
    box.insert(data, [-3, -2], 0);
    assertEquals(data, [-3, -2, -1, 0, 1, 2, 3], "insert item last position 2");
    assertEquals(control, -1);
    off();
    box.insert(data, [-5, -4], 0);
    assertEquals(
      data,
      [-5, -4, -3, -2, -1, 0, 1, 2, 3],
      "insert item last position 2",
    );
    assertEquals(control, -1);
  },
});

Deno.test({
  name: "insert one in the middle",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    const off = watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, 4, 1);
    assertEquals(data, [1, 4, 2, 3], "insert item last position");
    assertEquals(control, 2, "triggers listener");
    box.insert(data, 5, 2);
    assertEquals(data, [1, 4, 5, 2, 3], "insert item last position 2");
    assertEquals(control, 5);
    off();
    box.insert(data, 6, 1);
    assertEquals(data, [1, 6, 4, 5, 2, 3], "insert item last position 2");
    assertEquals(control, 5);
  },
});

Deno.test({
  name: "insert many in the middle",
  fn() {
    const box = createBox([1, 2, 3]);
    const data = box();
    let control = 0;
    watchProp(data, 2, (value) => {
      control = value;
    });
    box.insert(data, [8, 9], 1);
    assertEquals(data, [1, 8, 9, 2, 3], "insert item last position");
    assertEquals(control, 9, "triggers listener");
    box.insert(data, [-3, -2], 2);
    assertEquals(data, [1, 8, -3, -2, 9, 2, 3], "insert item last position 2");
    assertEquals(control, -3);
    box.insert(data, [-5, -4], 4);
    assertEquals(
      data,
      [1, 8, -3, -2, -5, -4, 9, 2, 3],
      "insert item last position 2",
    );
    assertEquals(control, -3);
  },
});
