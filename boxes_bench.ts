import { getBox } from "./boxes.ts";

const target = {
  a: 1,
  b: 2,
  c: { x: "1", y: "asdfas", z: [1, 2, 3, 4, 5] },
  d: { x: "1", y: "asdfas", z: [1, 2, 3, 4, 5] },
  e: { x: "1", y: "asdfas", z: [1, 2, 3, 4, 5] },
  f: { x: "1", y: "asdfas", z: [1, 2, 3, 4, 5] },
  g: { x: "1", y: "asdfas", z: [1, 2, 3, 4, 5] },
};

Deno.bench(function withStructuredClone() {
  structuredClone(target);
});

Deno.bench(function withGetBox() {
  getBox(target);
});
