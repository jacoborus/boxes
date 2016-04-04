Boxes
=====

Mutable state containers with time travelling for JavaScript apps

Boxes is written in vanilla ES6, so maybe you want to transpile it before using it.

*Work in progress* **API may change**

[![Build Status](https://travis-ci.org/jacoborus/boxes.svg?branch=master)](https://travis-ci.org/jacoborus/boxes)

- [boxes](#boxes-api)
- [box.get](#box-get-api)
- [box.save](#box-save-api)
- [box.onChange](#box-onChange-api)
- [box.trigger](#box-trigger-api)
- [box.undo and box.redo](#box-undo-redo-api)



<a name="boxes-api"></a>
## boxes(state)

Create and return a new box from a given object (`state`).

Every box has its independent history.

```js
let scope = {a:1, o: {x: true}}
let box = boxes(scope)
```



<a name="box-get-api"></a>
## box.get()

Returns the state of the box

```js
box.get() //=> {a:1, o: {x: true}}
```



<a name="box-save-api"></a>
## box.save(scope)

Save the state of the `scope` or box in history. `scope` is `state` by default

```js
// save state scope
box.save()
// save picked scope
box.save(scope.o)
```



<a name="box-subscribe-api"></a>
## box.subscribe(action[, scope])

Call the `action` when saving or triggering `scope`. `scope` is `state` by default

```js
box.subscribe(console.log)
scope.a = 99
box.save()
// console will print: {a: 99, o: {x: true}}

box.subscribe(console.log, scope.o)
scope.o.x = false
box.save(scope.o)
// console will print: {x: false}
```



<a name="box-trigger-api"></a>
## box.trigger(scope)

Trigger actions subscribed to a `scope`. `scope` is `state` by default

```js
// subscribe to a scope
box.subscribe(myAction, scope.o)
// save custom scope
box.trigger(scope.o)
// will call `myAction`
```



<a name="box-undo-redo-api"></a>
## box.undo() and box.redo()

Undo and redo changes in box

```js
let scope = {a: 1}
let box = boxes(scope)

delete scope.a
scope.b = 99
box.save()

box.undo()
scope.a === 1 // true
scope.b === undefined // true

box.redo()
scope.a === undefined // true
scope.b === 99 // true
```

<br><br>

---

© 2016 [Jacobo Tabernero](https://github.com/jacoborus) - Released under [MIT License](https://raw.github.com/jacoborus/boxes/master/LICENSE)
