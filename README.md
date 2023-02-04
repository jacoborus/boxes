# Boxes

(Work in progress)

```ts
import { getBox, watch } from "boxes";

const { box, update, patch } = getBox({
  a: "abc",
  o: {
    x: 1,
  },
});

// box is  { a: "abc", o: { x: 1 } }

// box is an immutable proxy of the origin
box === origin; // false
box.a === origin.a; // true
box.o === origin.o; // false
box.o.x === origin.o.x; // true

const unwatch = watch(box, () => console.log(box));

patch(box, { a: "xyz" });
// logs: { a: "xyz", o: { x: 1 } }

unwatch();
patch(box, { a: "123" });
// logs nothing, box === { a: "123", o: { x: 1 } }

watch(box.o, () => console.log("==>", box.o));
update(box.o, { x: 2 });
// logs: { x: 2 }
```

**API:**

- getBox
- watch

## getBox(origin)

Creates a BoxContainer for a origin object/array. This is a simple wrapper for
the box, and its mutation methods.

The origin should be a tree of objects and/or arrays that only contains numbers,
strings, Dates, booleans, BigInts or undefineds

```js
import { getBox } from "boxes";
const boxContainer = getBox({ a: 1 });
```

### BoxContainer.box

It's an immutable proxy of the origin. It can only be mutated with the mutation
methods of the same container

```js
import { getBox } from "boxes";
const { box } = getBox({ a: 1 });
```

### BoxContainer.update(target, payload)

Updates the main box, or any box created inside it

```js
import { getBox } from "boxes";
const { box, update } = getBox({ a: 1, o: { x: 1 } });
update(box.o, { x: 3 });
```

### BoxContainer.patch(target, payload)

Patches the main box, or any box created inside it

```js
import { getBox } from "boxes";
const { box, patch } = getBox({ a: 1, o: { x: 1 } });
patch(box, { a: 3 });
console.log(box);
// { a: 3, o: { x: 1 } }
```

## watch(target)

Watches a box and executes a callback every time the box changes. Returns a
function to destroy the listener

```js
import { getBox, watch } from "boxes";
const { box, patch } = getBox({ a: 1, o: { x: 1 } });
const unwatch = watch(box.o, () => console.log(box));
patch(box.o, { x: 99 });
// logs { x: 99 }
unwatch();
patch(box.o, { x: 6 });
// does not log anything
```
