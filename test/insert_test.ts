import { assertEquals } from "assert";
import { createBox, createCollection, watchProp } from "../boxes.ts";

Deno.test({
  name: "insert one at the end",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert(4);
    assertEquals(col, [1, 2, 3, 4], "insert item last position");
    assertEquals(control, 0, "does not trigger on previous items ");
    setCol.insert(5);
    assertEquals(col, [1, 2, 3, 4, 5], "remove item last position");
    assertEquals(control, 0);
  },
});

Deno.test({
  name: "insert many at the end",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert([4, 5]);
    assertEquals(col, [1, 2, 3, 4, 5], "insert item last position");
    assertEquals(control, 0, "does not trigger on previous items ");
    setCol.insert([6, 7]);
    assertEquals(col, [1, 2, 3, 4, 5, 6, 7], "remove item last position");
    assertEquals(control, 0);
  },
});

Deno.test({
  name: "insert one at the beginning",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    const off = watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert(4, 0);
    assertEquals(col, [4, 1, 2, 3], "insert item last position");
    assertEquals(control, 2, "triggers listener");
    setCol.insert(5, 0);
    assertEquals(col, [5, 4, 1, 2, 3], "insert item last position 2");
    assertEquals(control, 1);
    off();
    setCol.insert(6, 0);
    assertEquals(col, [6, 5, 4, 1, 2, 3], "insert item last position 2");
    assertEquals(control, 1);
  },
});

Deno.test({
  name: "insert many at the beginning",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    const off = watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert([-1, 0], 0);
    assertEquals(col, [-1, 0, 1, 2, 3], "insert item last position");
    assertEquals(control, 1, "triggers listener");
    setCol.insert([-3, -2], 0);
    assertEquals(col, [-3, -2, -1, 0, 1, 2, 3], "insert item last position 2");
    assertEquals(control, -1);
    off();
    setCol.insert([-5, -4], 0);
    assertEquals(
      col,
      [-5, -4, -3, -2, -1, 0, 1, 2, 3],
      "insert item last position 2",
    );
    assertEquals(control, -1);
  },
});

Deno.test({
  name: "insert one in the middle",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    const off = watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert(4, 1);
    assertEquals(col, [1, 4, 2, 3], "insert item last position");
    assertEquals(control, 2, "triggers listener");
    setCol.insert(5, 2);
    assertEquals(col, [1, 4, 5, 2, 3], "insert item last position 2");
    assertEquals(control, 5);
    off();
    setCol.insert(6, 1);
    assertEquals(col, [1, 6, 4, 5, 2, 3], "insert item last position 2");
    assertEquals(control, 5);
  },
});

Deno.test({
  name: "insert many in the middle",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert([8, 9], 1);
    assertEquals(col, [1, 8, 9, 2, 3], "insert item last position");
    assertEquals(control, 9, "triggers listener");
    setCol.insert([-3, -2], 2);
    assertEquals(col, [1, 8, -3, -2, 9, 2, 3], "insert item last position 2");
    assertEquals(control, -3);
    setCol.insert([-5, -4], 4);
    assertEquals(
      col,
      [1, 8, -3, -2, -5, -4, 9, 2, 3],
      "insert item last position 2",
    );
    assertEquals(control, -3);
  },
});

Deno.test({
  name: "insert one at the end, omit proxy",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert(4);
    assertEquals(col, [1, 2, 3, 4], "insert item last position");
    assertEquals(control, 0, "does not trigger on previous items ");
    setCol.insert(5);
    assertEquals(col, [1, 2, 3, 4, 5], "remove item last position");
    assertEquals(control, 0);
  },
});

Deno.test({
  name: "insert many in the middle, omit proxy",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3]);
    let control = 0;
    watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.insert([8, 9], 1);
    assertEquals(col, [1, 8, 9, 2, 3], "insert item last position");
    assertEquals(control, 9, "triggers listener");
    setCol.insert([-3, -2], 2);
    assertEquals(col, [1, 8, -3, -2, 9, 2, 3], "insert item last position 2");
    assertEquals(control, -3);
    setCol.insert([-5, -4], 4);
    assertEquals(
      col,
      [1, 8, -3, -2, -5, -4, 9, 2, 3],
      "insert item last position 2",
    );
    assertEquals(control, -3);
  },
});
