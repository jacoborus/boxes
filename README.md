Boxes
=====

Mutable state containers with time travelling for JavaScript apps

Boxes is written in vanilla ES6, so maybe you want to transpile it before using it.

[Live demo](https://jsfiddle.net/jacoborus/t98z7sts/1/) (for modern browsers)

**Project in active development, API may change**

[![Build Status](https://travis-ci.org/jacoborus/boxes.svg?branch=master)](https://travis-ci.org/jacoborus/boxes) [![npm version](https://badge.fury.io/js/boxes.svg)](https://www.npmjs.com/package/boxes)

- [boxes](#boxes-api)
- [box.get](#box-get-api)
- [box.save](#box-save-api)
- [box.on and unsubscribe](#box-on-api)
- [box.off](#box-off-api)
- [box.emit](#box-emit-api)
- [box.undo and box.redo](#box-undo-redo-api)
- [box.records](#box-records-api)
- [box.log](#box-log-api)
- [box.now](#box-now-api)
- [Testing](#testing)
- [Building](#building)



<a name="boxes-api"></a>
## boxes(state)

Create and return a new box from a given object (`state`).

Every box has its independent history.

```js
let state = {a:1, o: {x: true}}
let box = boxes(state)
```



<a name="box-get-api"></a>
## box.get()

Returns the state of the box

```js
box.get() //=> {a:1, o: {x: true}}
```



<a name="box-save-api"></a>
## box.save(scope)

Save `scope` changes in history. `scope` is `state` by default. `save` method returns the box, so you can chain multiple calls

```js
// save state scope
box.save()
// save picked scope
box.save(scope.o)
```



<a name="box-on-api"></a>
## box.on([scope,] action) and unsubscribe()

Subscribe `action` method to changes in `scope`.  That `action` will be launched on `scope` saving. `scope` is `state` by default.

`on` returns `unsubscribe` method.

```js
let unsubscribe = box.subscribe(console.log)
scope.a = 99
box.save()
// console will print: {a: 99, o: {x: true}}

unsubscribe()
scope.a = 3
box.save()
// console will print nothing

box.on(scope.o, console.log)
scope.o.x = false
box.save(scope.o)
// console will print: {x: false}
```



<a name="box-off-api"></a>
## box.off(scope, action)

Remove listener `action` from `scope` bindings

```js
const state = {a: 1}
const box = boxes(state)
let control = 0
const fn = () => control++
box.on(fn)
box.emit()
control === 1 // true

box.off(state, fn)
box.emit()
control === 1 // true
```



<a name="box-emit-api"></a>
## box.emit(scope)

emit subscriptions without saving `scope`. `scope` is `state` by default. `emit` method returns the box, so you can chain multiple calls

```js
// subscribe to a scope
box.on(scope.o, myAction)
// will call `myAction`
box.emit(scope.o)
```



<a name="box-undo-redo-api"></a>
## box.undo(steps) and box.redo(steps)

Undo and redo changes in `state`. `steps` is a number greater than 0, by default `1`. Both methods returns the actual position in history

```js
let state = {a: 1}
let box = boxes(state)

delete state.a
state.b = 99
box.save()

state.b = 'boxes!'
box.save()

box.undo()
state.a === undefined // true
state.b === 99 // true

box.undo()
state.a === 1 // true
state.b === undefined // true

box.redo(2)
state.a === undefined // true
state.b === 'boxes!' // true
```



<a name="box-records-api"></a>
## box.records

Boxes saves every change with a log. You can examine this array in `box.records`.




<a name="box-log-api"></a>
## box.log(info)

Change the log `info` of last commit. `info` can be any type.
The log info of every change is `Date.now()` by default, but you can change it with `box.log(info)`


```js
let state = {a: 1}
let box = boxes(state)

box.log('this is the initial state')
state.a = 99
box.save() // will log `Date.now()`

box.records // ['this is the initial state', 1460337512847]
```



<a name="box-now-api"></a>
## box.now(position)

Travel in history to story in `position`, then return the actual position in the history as a number

```js
let state = {a: 1}
let box = boxes(state)

box.now() === 0 // true

state.a = 9
box.save().now() === 1 // true

box.undo()
box.now() === 0 // true

box.now(1)
box.now() === 1 // true
```




<a name="testing"></a>
## Testing

### Node

```sh
npm test
```

### Browser

Open `test/test.html`



<a name="building"></a>
## Building

- Build UMD file: `npm run build-umd`
- Build browser tests: `npm run build-tests`
- Run both builds: `npm run build`



<br><br>

---

© 2016 [Jacobo Tabernero](https://github.com/jacoborus) - Released under [MIT License](https://raw.github.com/jacoborus/boxes/master/LICENSE)
