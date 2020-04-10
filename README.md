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
// logs: [{ a: 'hello' }, 'a', 'set', 1, 'hello']
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
// logs: [{ a: 'hello' }, 'a', 'set', 1, 'hello']
```

It also works with dot notation:

```js
const box = getBox({ o: { a: 1  } })
const handler = (...change) => console.log(change)
boxes.on(box, 'o.a', handler)

box.o.a = 'hello'
['set', 'a', 1, 'hello', { a: 'hello' }]

box.o = { a: 'bye' }
// logs: [{ a: 'bye' }, 'a', 'set', 'hello', 'bye']
```

### off(box, prop, handler)

Removes `handler` from the box

```js
boxes.off(box, 'propName', action)
```


## Emitter

Boxes will emit the changes made in the observed objects.

### Change signatures:

Generic signature: `[box, property, changeType, oldValue, newValue]`

Object:

- set:
  - signature: `[box, property, 'set', oldValue, newValue]`
  - on: literal assignation, Object.assign, ...
- delete:
  - signature: `[box, property, 'delete', oldValue, undefined]`
  - on: delete operator

Array:

- set:
  - signature: `[box, property, 'set', oldValue, newValue]`
  - on: copyWithin, fill, splice and literal assignation
- delete:
  - signature: `[box, property, 'delete', oldValue, undefined]`
  - on: delete operator
- insert:
  - signature: `[box, property, 'insert', undefined, newValue]`
  - on: push, splice, unshift
- remove:
  - signature: `[box, property, 'remove', oldValue, undefined]`
  - on: pop, shift, splice
- swap:
  - signature: `[box, property, 'swap', oldValue, newValue]`
  - on: reverse , sort
- length:
  - signature: `[box, firstIndexChanged || undefined, 'length',  oldLength, newLength]`
  - on: pop, push, shift, splice, unshift
  - `firstIndexChanged` will be passed only on shift, splice and unshift
    because on pop and push no index will change
