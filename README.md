Boxes
=====

Predictable state container for JavaScript apps

*Work in progress* **API may change**

**Requires harmony flags:** `--harmony_default_parameters --harmony_destructuring`

- [boxes](#boxes-api)
- [box.get](#box-get-api)
- [box.save](#box-save-api)
- [box.onChange](#box-onChange-api)
- [box.trigger](#box-trigger-api)
- [box.undo](#box-undo-api)
- [box.redo](#box-redo-api)


<a name="boxes-api"></a>
boxes (initialState)
--------------------

Create and return a new box from a given object (`initialState`).

Every box has its independent history.

```js
let scope = {a:1, o: {x: true}}
let box = boxes(scope)
```


<a name="box-get-api"></a>
box.get ()
----------

Returns the content of the box

```js
box.get() //=> {a:1, o: {x: true}}
```


<a name="box-save-api"></a>
box.save (target)
-----------------

Save the state of the `target` or box in history. Default `target` is main scope

```js
// save main scope
box.save()
// save custom scope
box.save(scope.o)
```


<a name="box-subscribe-api"></a>
box.subscribe (action[, target])
--------------------------------

Call the `action` when saving or triggering `target`. Default target is main scope (state)

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
box.trigger (target)
--------------------

Trigger actions subscribed to a `scope`. Default `target` is main scope

```js
// subscribe to a target
box.subscribe(myAction, scope.o)
// save custom scope
box.trigger(scope.o)
// will call `myAction`
```


<a name="box-undo-api"></a>
undo ()
-------

Undo last change in box


```js
let scope = {a: 1}
let box = boxes(scope)

delete scope.a
scope.b = 99
box.save()

box.undo()
scope.a === 1 // true
scope.b === undefined // true
```



<a name="box-redo-api"></a>
redo ()
------------

Redo change in box


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
