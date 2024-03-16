import { assertEquals } from "assert";
import { watchProp } from "../boxes.ts";
import { createCollection } from "../src/collection.ts";

Deno.test({
  name: "extract one",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3, 4, 5, 6, 7, 8]);
    let control = 0;
    const off = watchProp(col, 2, (value) => {
      control = value;
    });
    setCol.extract(3);
    assertEquals(col, [1, 2, 3, 5, 6, 7, 8], "extract item");
    assertEquals(control, 0, "does not trigger on previous items ");
    setCol.extract(1);
    assertEquals(col, [1, 3, 5, 6, 7, 8], "extract item");
    assertEquals(control, 5);
    off();
    setCol.extract(0);
    assertEquals(col[0], 3);
    assertEquals(control, 5);
  },
});

Deno.test({
  name: "extract last",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3, 4, 5, 6, 7, 8]);
    let control = 0 as number | undefined;
    let count = 0;
    const off = watchProp(col, 6, (value) => {
      count++;
      control = value;
    });
    setCol.extract();
    assertEquals(col, [1, 2, 3, 4, 5, 6, 7], "extract last item 1");
    assertEquals(control, 0, "does not trigger on previous items ");
    assertEquals(count, 0);
    setCol.extract();
    assertEquals(col, [1, 2, 3, 4, 5, 6], "extract item");
    assertEquals(control, undefined);
    assertEquals(count, 1);
    off();
    setCol.extract();
    assertEquals(col, [1, 2, 3, 4, 5], "extract last item");
    assertEquals(control, undefined);
    assertEquals(count, 1);
  },
});

Deno.test({
  name: "extract more",
  fn() {
    const [col, setCol] = createCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let control = 0;
    const off = watchProp(col, 2, (value) => {
      control = value;
    });
    const result = setCol.extract(3, 3);
    assertEquals(col, [1, 2, 3, 7, 8, 9, 10], "extract items");
    assertEquals(result, [4, 5, 6], "extract items result");
    assertEquals(control, 0, "does not trigger on previous items ");
    setCol.extract(1, 2);
    assertEquals(col, [1, 7, 8, 9, 10], "extract item");
    assertEquals(control, 8);
    off();
    setCol.extract(0, 2);
    assertEquals(col, [8, 9, 10], "extract item");
    assertEquals(control, 8);
  },
});
