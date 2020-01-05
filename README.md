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
  name: 'avocado',
  amount: 1,
  sale: true
}
const mybox = new Boxes.box(origin)
console.log(mybox)
/* outputs: {
  name: 'avocado',
  amout: 4,
  sale: true
} */

origin.amount = 99

console.log(mybox.amount)
// outputs: 1
mybox.amount = 99
// throws error
```

### Boxes.Box.set(box, propName, value)

### Boxes.List(Array)

Create a new list. A list is like an array, but their values can't be assign without one of the Boxes mutability methods.

The only array methods that doesn't mutate the array will be present in the list.

Parameter origin should be an array

It internally creates a copy of your object, changing the inside objects with boxes and arrays with lists. Then creates a Proxy from this copy which handler only allows properties to be read, not changed.

```js
const fruits = ['avocado', 'orange', 'melon']

const mylist = new Boxes.Box(fruits)
console.log(mybox)
/* outputs: ['avocado', 'orange', 'melon']

fruits[0] = 'apple'
console.log(fruits)
/* outputs: ['apple', 'orange', 'melon']

console.log(mylist)
/* outputs: ['avocado', 'orange', 'melon']

mylist[0] = 'apple'
// throws error
```
