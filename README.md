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
// logs: ['set', 'a', 1, 'hello']
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
// logs: ['set', 1, 'hello']
```

It also works with dot notation:

```js
const box = getBox({ o: { a: 1  } })
const handler = (...change) => console.log(change)
boxes.on(box, 'o.a', handler)

box.o.a = 'hello'
// logs: ['set', 1, 'hello']

box.o = { a: 'bye' }
// logs: ['set', 'hello', 'bye']
```

### off(box, prop, handler)

Removes `handler` from the box

```js
boxes.off(box, 'propName', action)
```


## Emitter

Boxes will emit the changes made in the observed objects.

### Change signatures:

Object:

- set:
  - signature: `['set', property, oldValue, newValue]`
  - on: literal assignation, Object.assign, ...
- delete:
  - signature: `['delete', property, oldValue]`
  - on: delete operator

Array:

- set:
  - signature: `['set', oldValue, newValue]`
  - on: copyWithin, fill, splice and literal assignation
- delete:
  - signature: `['delete', oldValue]`
  - on: delete operator
- insert:
  - signature: `['insert', undefined, newValue]`
  - on: push, splice, unshift
- remove:
  - signature: `['remove', oldValue]`
  - on: pop, shift, splice
- swap:
  - signature: `['swap', oldValue, newValue, encore]`
  - swap will be called twice (one per index changed):
    - `['swap', oldValue, newValue, false]`
    - `['swap', oldValue, newValue, true]`
  - on: reverse (working), sort (WIP, using 'set' ATM)
- length:
  - signature: `[length, firstIndexChanged]`
  - on: pop, push, shift, splice, unshift
  - `firstIndexChanged` will be passed only on shift, splice and unshift
    because on pop and push no index will change
