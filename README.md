Boxes
=====

(Work in progress)

Reactive state containers focused on DOM performance

```js
import { getBox, on } from 'Boxes'

const origin = {
  a: 1
}

const box = getBox(origin)
box // { a: 1 }
box === origin // false

on(box, 'a', (...change) => console.log(change))
box.a = 'hello'
// logs: ['set', 'a', 1, 'hello', { a: 'hello' }]
```

## API

- getBox
- on
- off

### on(box, prop, handler)

Adds `handler` to box

```js
const box = getBox({ a: 1 })
const handler = (...change) => console.log(change)
boxes.on(box, 'a', handler)

box.a = 'hello'
// logs: ['set', 'a', 1, 'hello', { a: 'hello' }]
```

It also works with dot notation:

```js
const box = getBox({ o: { a: 1  } })
const handler = (...change) => console.log(change)
boxes.on(box, 'o.a', handler)

box.o.a = 'hello'
['set', 'a', 1, 'hello', { a: 'hello' }]

box.o = { a: 'bye' }
// logs: ['set', 'a', 'hello', 'bye', { a: 'bye' }]
```

### off(box, prop, handler)

Removes `handler` from the box

```js
boxes.off(box, 'propName', action)
```


## Emitter

Boxes will emit the changes made in the observed objects.

### Change signatures:

Generic: `[changeType, property, oldValue, newValue, box]`

Object:

- set:
  - signature: `['set', property, oldValue, newValue, box]`
  - on: literal assignation, Object.assign, ...
- delete:
  - signature: `['delete', property, oldValue, undefined, box]`
  - on: delete operator

Array:

- set:
  - signature: `['set', property, oldValue, newValue, box]`
  - on: copyWithin, fill, splice and literal assignation
- delete:
  - signature: `['delete', property, oldValue, undefined, box]`
  - on: delete operator
- insert:
  - signature: `['insert', property, undefined, newValue, box]`
  - on: push, splice, unshift
- remove:
  - signature: `['remove', property, oldValue, undefined, box]`
  - on: pop, shift, splice
- swap:
  - signature: `['swap', property, oldValue, newValue, box]`
  - on: reverse (working), sort (WIP, using 'set' ATM)
- length:
  - signature: `[length, firstIndexChanged || undefined, oldLength, newLength,  box]`
  - on: pop, push, shift, splice, unshift
  - `firstIndexChanged` will be passed only on shift, splice and unshift
    because on pop and push no index will change
