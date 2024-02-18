import { assertEquals } from "assert";
import { computed, createBox, createThingy } from "../boxes.ts";

Deno.test({
  name: "basic computed with 1 box",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const box = createBox(obj);
    const data = box();
    const comp = computed(() => data.a + data.o.x);
    assertEquals(comp(), 100);
    box.patch(data, { a: 4, o: { x: 5 } });
    assertEquals(comp(), 9);
  },
});

Deno.test({
  name: "basic computed with 1 box 1 thing",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const box = createBox(obj);
    const data = box();
    const [thing, setThing] = createThingy(8);
    const comp = computed(() => data.a + data.o.x - thing());
    assertEquals(comp(), 92);
    box.patch(data, { a: 4, o: { x: 5 } });
    assertEquals(comp(), 1);
    setThing(10);
    assertEquals(comp(), -1);
  },
});

Deno.test({
  name: "computed recomputed",
  fn() {
    const obj = { a: 1, o: { x: 99 } };
    const box = createBox(obj);
    const data = box();
    const [thing, setThing] = createThingy(8);
    const comp = computed(() => {
      if (thing() % 2 === 0) return data.a + data.o.x;
      return data.a - thing();
    });
    assertEquals(comp(), 100);
    setThing(7);
    assertEquals(comp(), -6);
    setThing(6);
    assertEquals(comp(), 100);
  },
});
