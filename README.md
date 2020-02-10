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

- set (objects and arrays): `['set', position/prop, oldValue, newValue]`
- delete (objects and arrays): `['delete', position/prop, oldValue]`
- insert (arrays): `['insert', position/prop, newValue]`
- remove (arrays): `['remove', position/prop, oldValue]`
- length (arrays): `['length', position/prop, firstPositionChanged]`
