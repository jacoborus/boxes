Boxes
=====

Mutable state containers with time travelling for JavaScript apps

Boxes is written in vanilla ES6, so maybe you want to transpile it before using it.

[Live demo](https://jsfiddle.net/jacoborus/t98z7sts/1/) (for modern browsers)

**Project in active development, API may change**

[![Build Status](https://travis-ci.org/jacoborus/boxes.svg?branch=master)](https://travis-ci.org/jacoborus/boxes) [![npm version](https://badge.fury.io/js/boxes.svg)](https://www.npmjs.com/package/boxes) ![npm dependencies](https://david-dm.org/jacoborus/boxes.svg)

- [API](#boxes-api)
    - [boxes](#boxes-constructor-api)
    - [box.get](#box-get-api)
    - [box.save](#box-save-api)
    - [box.on](#box-on-api)
    - [box.off](#box-off-api)
    - [box.emit](#box-emit-api)
    - [box.undo and box.redo](#box-undo-redo-api)
    - [box.log](#box-log-api)
- [Testing](#testing)
- [Building](#building)


<a name="boxes-api"></a>
## API

<a name="boxes-constructor-api"></a>
### boxes(state)

Create and return a new box from a given `state` object.

Every box has its independent history.

```js
let state = {a:1, o: {x: true}}
let box = boxes(state)
```



<a name="box-get-api"></a>
### box.get()

Returns the state of the box

```js
box.get() //=> {a:1, o: {x: true}}
```



<a name="box-save-api"></a>
### box.save(scope)

Save `scope` changes in history. `scope` is `state` by default. `save` method returns the box, so you can chain multiple calls

```js
// save state scope
box.save()
// save picked scope
box.save(scope.o)
```



<a name="box-on-api"></a>
### box.on([scope,] action) and unsubscribe()

Subscribe `action` method to changes in `scope`.  That `action` will be launched on `scope` saving. `scope` is `state` by default.

```js
box.on(() => console.log('state changed!'))
scope.a = 99
box.save()
// 'state changed!'

box.on(scope.o, console.log('object changed!'))
scope.o.x = false
box.save(scope.o)
// 'object changed!'
```



<a name="box-off-api"></a>
### box.off(scope, action)

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
### box.emit(scope)

emit subscriptions without saving `scope`. `scope` is `state` by default. `emit` method returns the box, so you can chain multiple calls

```js
// subscribe to a scope
box.on(scope.o, myAction)
// will call `myAction`
box.emit(scope.o)
```



<a name="box-undo-redo-api"></a>
### box.undo(steps) and box.redo(steps)

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



<a name="box-log-api"></a>
### box.log(info)

Change the log `info` of last commit. `info` can be any type.
The log info of every change is `Date.now()` by default, but you can change it with `box.log(info)`


```js
let state = {a: 1}
let box = boxes(state)

box.log('this is the initial state')
state.a = 99
box.save() // will log `Date.now()`
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
