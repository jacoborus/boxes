Boxes
=====

Experimental mutable state containers for javascript apps

## API

### Boxes

```js
import Boxes from 'Boxes'
```

### Boxes.Box(Object)

Create a new box. A box is like an object, but their values can't be assign without one of the Boxes mutability methods.

Parameter origin should be a object, box or list

It internally creates a copy of your object, changing the inside objects with boxes and arrays with lists. Then creates a Proxy from this copy which handler only allows properties to be read, not changed.

```js
const origin = {
  name: 'tomato',
  amount: 1,
  sale: true
}
const mybox = new Boxes.box(origin)
console.log(mybox)
/* mybox === {
  name: 'tomato',
  amout: 4,
  sale: true
} */

origin.amount = 99
// origin.amount === 1
// mybox.amount === 1

mybox.amount = 99
// throws error
```

### Boxes.Box.set(box, propName, value)

### Boxes.Box(Array)

Create a new list. A list is like an array, but their values can't be assign without one of the Boxes mutability methods.

The only array methods that doesn't mutate the array will be present in the list.

Parameter origin should be an array

It internally creates a copy of your object, changing the inside objects with boxes and arrays with lists. Then creates a Proxy from this copy which handler only allows properties to be read, not changed.

```js
const fruits = ['avocado', 'orange', 'melon']

const mylist = new Boxes.Box(fruits)
// mybox: ['avocado', 'orange', 'melon']

fruits[0] = 'apple'
// fruits === ['apple', 'orange', 'melon']
// mybox === ['avocado', 'orange', 'melon']

mylist[0] = 'apple'
// throws error
```

### Boxes.set(box, propName, value)

To assign a value you can use the `set` method, it will convert any object inside the value to a box

```js
const { Box, set } = require('boxes')
const mybox = new Boxes.box({
  amount: 1,
  sale: true
})

set(mybox, 'amount', 55)
// mybox.amount === 55
```

### Boxes.on(box, callback(prop, oldValue))

```js
const { Box, set, on } = require('boxes')
const mybox = new Box({ a: 1 })
on(mybox, (prop, oldValue) => {
  console.log('prop:', prop)
  console.log('oldValue:', oldValue)
})
set(box, 'a', 99)
// ==> prop: 'a'
// ==> oldValue: 1
```
