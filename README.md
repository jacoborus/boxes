Boxes
=====

Predictable state container for JavaScript apps

*Work in progress* **API may change**

**Requires harmony flags:** `--harmony_default_parameters --harmony_destructuring`

- [boxes](#boxes-api)
- [box.get](#box-get-api)
- [box.save](#box-save-api)
- [box.onChange](#box-onChange-api)
- [box.prevState](#box-prevState-api)
- [box.nextState](#box-nextState-api)


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

Trigger the function `action` when saving state of `target`. Default target is main scope 

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


<a name="box-prevState-api"></a>
prevState ()
------------

Undo last change in box


```js
let scope = {a: 1}
let box = boxes(scope)

delete scope.a
scope.b = 99
box.save()

box.prevState()
scope.a === 1 // true
scope.b === undefined // true
```



<a name="box-nextState-api"></a>
nextState ()
------------

Redo change in box


```js
let scope = {a: 1}
let box = boxes(scope)

delete scope.a
scope.b = 99
box.save()

box.prevState()
scope.a === 1 // true
scope.b === undefined // true

box.nextState()
scope.a === undefined // true
scope.b === 99 // true
```

<br><br>

---

© 2016 [Jacobo Tabernero](https://github.com/jacoborus) - Released under [MIT License](https://raw.github.com/jacoborus/boxes/master/LICENSE)
