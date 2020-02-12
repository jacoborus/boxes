Boxes
=====

(Work in progress)

Reactive state containers focused on DOM performance

```js
import { Box, on } from 'Boxes'

const origin = {
  a: 1
}

const box = Box(origin)
box // { a: 1 }
box === origin // false

on(box, change => console.log(change))
box.a = 'hello'
// logs: ['set', 'a', 1, 'hello']
```

## API

- Box
- on
- off
- clear

### on(box, handler)

Adds `handler` to box

```js
const box = Box({ a: 1 })
const handler = change => console.log(change)
boxes.on(box, handler)

box.a = 'hello'
// logs: ['set', 'a', 1, 'hello']
```

### off(box, handler)

Removes `handler` from the box

```js
boxes.off(box, action)
```


### clear(box)

Removes all the handlers of the box

```js
emitter.clear(box)
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
  - signature: `['set', index, oldValue, newValue]`
  - on: copyWithin, fill, splice and literal assignation
- delete:
  - signature: `['delete', index, oldValue]`
  - on: delete operator
- insert:
  - signature: `['insert', index, newValue]`
  - on: push, splice, unshift
- remove:
  - signature: `['remove', index, oldValue]`
  - on: pop, shift, splice
- swap:
  - signature: `['swap', firstIndex, secondIndex]`
  - on: reverse (working), sort (WIP, using 'set' ATM)
- length:
  - signature: `['length', length, firstIndexChanged]`
  - on: pop, push, shift, splice, unshift
  - firstIndexChanged will be passed only on shift, splice and unshift
    because on pop and push no index will change
