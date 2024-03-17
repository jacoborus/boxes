import { assertEquals } from "assert";
import { batch, createBox, watchProp } from "../boxes.ts";

Deno.test({
  name: "batch",
  fn() {
    const [box, setBox] = createBox({ a: 1 });
    let count = 0;
    const off = watchProp(box, "a", () => {
      count++;
    });
    batch(() => {
      setBox({ a: 4 });
      setBox({ a: 6 });
      setBox.merge({ a: 9 });
    });
    assertEquals(count, 1, "batch works");
    setBox({ a: 88 });
    assertEquals(count, 2);
    off();
    setBox({ a: 6 });
    assertEquals(count, 2);
  },
});
