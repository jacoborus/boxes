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
// logs: ['set', a, 1, 'hello']
```

## API

- Box
- on
- off
- clear

## Emitter

Boxes will emit the changes made in the observed objects.

### Change signatures:

Object:

- set: `['set', prop/index, oldValue, newValue]` (literal assignation, Object.assign, ...)
- delete: `['delete', prop/index, oldValue]` (delete operator)

Array:

- set:
  - signature: `(arrays)['set', prop/index, oldValue, newValue]`
  - on: copyWithin, fill, splice and literal assignation
- delete:
  - signature: `['delete', prop/index, oldValue]`
  - on: delete operator
- insert:
  - signature: `['insert', index, newValue]`
  - on: push, splice, unshift
- remove:
  - signature: `['remove', index, oldValue]`
  - on: pop, shift, splice
- swap (WIP):
  - signature: `['swap', firstIndex, secondIndex]`
  - on: sort, reverse
- length (WIP):
  - signature: `['length', length, firstPositionChanged]`
  - on: pop, push, shift, splice, unshift
