import { assertEquals } from "assert";
import { computed, createBox, createThingy } from "../boxes.ts";

Deno.test({
  name: "basic computed with 1 box",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const [box, setBox] = createBox(obj);
    const comp = computed(() => box.a + box.o.x);
    assertEquals(comp(), 100);
    setBox.merge({ a: 4, o: { x: 5 } });
    assertEquals(comp(), 9);
  },
});

Deno.test({
  name: "basic computed with 1 box 1 thing",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const [box, setBox] = createBox(obj);
    const [thing, setThing] = createThingy(8);
    const comp = computed(() => box.a + box.o.x - thing());
    assertEquals(comp(), 92);
    setBox.merge({ a: 4, o: { x: 5 } });
    assertEquals(comp(), 1);
    setThing(10);
    assertEquals(comp(), -1);
  },
});

Deno.test({
  name: "computed recomputed",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const [box] = createBox(obj);
    const [thing, setThing] = createThingy(8);
    const comp = computed(() => {
      if (thing() % 2 === 0) return box.a + box.o.x;
      return box.a - thing();
    });
    assertEquals(comp(), 100);
    setThing(7);
    assertEquals(comp(), -6);
    setThing(6);
    assertEquals(comp(), 100);
  },
});

Deno.test({
  name: "computed trigger count",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const [box, setBox] = createBox(obj);
    let count = 0;
    const comp = computed(() => {
      count++;
      return box.a + box.o.x;
    });
    assertEquals(count, 1, "first count");
    setBox.merge({ a: 3, o: { x: 55 } });
    assertEquals(count, 2, "second count");
    assertEquals(comp(), 58);
    setBox.merge({ a: 4, o: { x: 5 } });
    assertEquals(comp(), 9, "third count");
    assertEquals(count, 3, "third count");
  },
});
