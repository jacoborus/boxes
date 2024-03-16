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
      setBox.update({ a: 4 });
      setBox.update({ a: 6 });
      setBox.merge({ a: 9 });
    });
    assertEquals(count, 1, "batch works");
    setBox.update({ a: 88 });
    assertEquals(count, 2);
    off();
    setBox.update({ a: 6 });
    assertEquals(count, 2);
  },
});
