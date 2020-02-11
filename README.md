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

Change signatures:

- set (objects and arrays): `['set', prop/index, oldValue, newValue]` (literal assignation)
- delete (objects and arrays): `['delete', prop/index, oldValue]` (delete operator)
- insert (arrays): `['insert', index, newValue]` (push, splice, unshift)
- remove (arrays): `['remove', index, oldValue]` (pop, shift, splice)
- swap (arrays): `['swap', firstIndex, secondIndex]` (sort, reverse)
- length (arrays): `['length', length, firstPositionChanged]`
