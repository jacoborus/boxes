# Boxes

(Work in progress)

```ts
import { getBox, watch } from "boxes";

const origin = {
  a: "abc",
  o: {
    x: 1,
  },
};

const box = getBox(origin);

const { update, patch } = box;
const data = box(); // { a: "abc", o: { x: 1 } }

// data is a readonly proxy of the origin
data === origin; // false
data.a === origin.a; // true
data.o === origin.o; // false
data.o.x === origin.o.x; // true

const unwatch = watch(data, () => console.log(data));

patch(data, { a: "xyz" });
// logs: { a: "xyz", o: { x: 1 } }

unwatch();
patch(data, { a: "123" });
// logs nothing, data === { a: "123", o: { x: 1 } }

watch(data.o, () => console.log("==>", data.o));
update(data.o, { x: 2 });
// logs: ==> { x: 2 }
```

**API:**

- getBox
- watch

## getBox(origin)

Creates a box.

The origin should be a tree of objects and/or arrays that only contains numbers,
strings, Dates, booleans, BigInts or undefineds

```js
import { getBox } from "boxes";
const box = getBox({ a: 1 });
```

## Box

It's a function that returns a readonly proxy of the origin

```js
import { getBox } from "boxes";
const box = getBox({ a: 1 });

console.log(box());
// { a:1 }
```

**Dict methods**:

- update
- patch


**List methods**:

- push: like js
- pop: like js
- shift: like js
- unshift: like js
- reverse: like js
- sort: like js

- insert(pos, item1, item2, ...itemn)
- extract(from, amount)
- ? add(item, key?) adds item if not found. Optional: filter by key
- ? remove(item, key?) removes item from the list. Optional: filter by key


### Box.update(target, payload)

Updates the box data

```js
import { getBox } from "boxes";
const box = getBox({ a: 1, o: { x: 1 } });
const data = box();
box.update(data.o, { x: 3 });
console.log(box());
// { a: 1, o: { x: 3 } }
```

### Box.patch(target, payload)

Patches the box data. To delete a property, pass its value as null

```js
import { getBox } from "boxes";

const box = getBox({
  a: 1,
  o: {
    x: 1,
  },
});
box.patch(box(), { a: 3 });
console.log(box());
// { a: 3, o: { x: 1 } }

box.patch(box(), { a: null });
console.log(box());
// { o: { x: 1 } }
```

### Box.push(target, ...items)

Pushes to the box data. Only allowed for arrays

```js
import { getBox } from "boxes";

const arr = [1, 2, 3];
const box = getBox(arr);
const data = box();
box.push(data, 4);
box.push(data, 5);
console.log(data);
// [1, 2, 3, 4, 5]
```

## watch(target)

Watches the box data and executes a callback every time it changes. It can oly
watch objects and arrays.

Returns a function to destroy the listener

```js
import { getBox, watch } from "boxes";
const box = getBox({ a: 1, o: { x: 1 } });
const unwatch = watch(box().o, () => console.log(box().o));
box.patch(box().o, { x: 99 });
// logs { x: 99 }
unwatch();
box.patch(box().o, { x: 6 });
// does not log anything
```
