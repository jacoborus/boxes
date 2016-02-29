Boxes
=====

Predictable state container for JavaScript apps

*Work in progress*

**Requires harmony flags:** `--harmony_default_parameters --harmony_destructuring`

- [boxes](#boxes-api)
- [box.getBox](#box-getBox-api)
- [box.get](#box-get-api)
- [box.save](#box-save-api)
- [box.onChange](#box-onChange-api)
- [store.prevState](#store-prevState-api)
- [store.nextState](#store-nextState-api)


<a name="boxes-api"></a>
boxes (initialState)
--------------------

Create and return a new store from a given object or array (`initialState`).

A store is a box with a independent history. Stores has same properties as boxes plus `prevState` and `nextState`. All boxes inside a store will share same history line

```js
let scope = {o: {a: 1, b: 2}}
let store = boxes(scope)
```


<a name="box-getBox-api"></a>
box.getBox (target)
-------------------

Create and return a box from a object or array (`target`)

```js
let box = store.getBox(scope.o) // stores have same methods as boxes
console.log(box)
/* console prints:
  { get: [Function: get],
    getBox: [Function: getBox],
    onChange: [Function: onChange],
    save: [Function: save]}
*/
```


<a name="box-get-api"></a>
box.get ()
----------

Returns the content of the box

```js
box.get() //=> {a: 1, b: 2}
```


<a name="box-save-api"></a>
box.save ()
-----------

Save the state of the box in history

```js
box.save()
```


<a name="box-onChange-api"></a>
box.onChange (action)
---------------------

Trigger the function `action` when saving state  

```js
box.onChange(scope => console.log(scope))
box.get().a = 99
box.save()
// console will print: {a: 99, b: 2}
  
```


<a name="store-prevState-api"></a>
prevState ()
------------

Undo last change in store


```js
let scope = {a: 1}
let store = boxes(scope)

delete scope.a
scope.b = 99
store.save()

store.prevState()
scope.a === 1 // true
scope.b === undefined // true
```



<a name="store-nextState-api"></a>
nextState ()
------------

Redo change in store


```js
let scope = {a: 1}
let store = boxes(scope)

delete scope.a
scope.b = 99
store.save()

store.prevState()
scope.a === 1 // true
scope.b === undefined // true

store.nextState()
scope.a === undefined // true
scope.b === 99 // true
```

<br><br>

---

© 2016 [Jacobo Tabernero](https://github.com/jacoborus) - Released under [MIT License](https://raw.github.com/jacoborus/boxes/master/LICENSE)
