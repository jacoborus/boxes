Boxes
=====

Predictable state container for JavaScript apps

- [boxes api](#boxes-api)
- [store api](#store-api)
- [box api](#box-api)


<a name="boxes-api"></a>
boxes API
---------

- [boxes.createStore](#boxes-createStore)
- [boxes.has](#boxes-has)
- [boxes.remove](#boxes-remove)


<a name="boxes-createStore"></a>
### createStore (name, content)

Create a box in the top level of boxes with a independent history

**Parameters:**
- **name** *string*: name for the store
- **content** *object*: initial state for the store

**Returns** store *object*

```js
let store = boxes.createStore('mystore', {a: 1, b: 2})
```


<a name="boxes-has"></a>
### has (name)

check if there is a store with `name`

**parameters:**
- **name** *string*: name of the store

**returns** *boolean*

```js
boxes.has('mystore') // => true
```


<a name="boxes-remove"></a>
### remove (name)

Remove a store

**Parameters:**
- **name** *string*: name of the store

```js
boxes.remove('mystore') // => true
boxes.has('mystore') // => false
```


<a name="store-api"></a>
store API
---------

- [store.get](#store-get)
- [store.set](#store-set)
- [store.update](#store-update)
- [store.subscribe](#store-subscribe)
- [store.prevState](#store-prevState)
- [store.nextState](#store-nextState)
- [store.getBox](#store-getBox)


<a name="store-get"></a>
### get ()

Get the content of the store

**returns** *object*

```js
let store = boxes.createStore('mystore', {a: 1, o: {x: 99}})
store.get() // => {a: 1, o: {x: 99}}
```


<a name="store-set"></a>
### set (value [, key [, target]])

Set new content in store property

**Parameters:**
- **value** *whatever*: new content
- **key** *string*: property name. Optional, if key is not passed value will replace the actual store
- **target** *string*: property name. Optional: if only target is missing a prop in store will be replaced

```js
store.set(2, 'a')
store.get() // => {a: 2, o: {x: 99}}

store.set(88, x, store.get().o)
store.get() // => {a: 2, o: {x: 88}}

store.set({a: 1, o: {x: 99}})
store.get() // => {a: 1, o: {x: 99}
```


<a name="store-update"></a>
### update (props [, key [, target]])

Set multiple properties in `target`. If a value is null the property will be deleted

**Parameters:**
- **props** *objec*: a list with properties and values
- **key** *String|Number*: Optional: use for update a prop in store
- **target** *objec*: object for update its `key` properties

```js
store.update({a: null, b: true})
store.get() // => {b: true, o: {x: 99}}

store.update({x: null, z: {a: 1}}, 'o')
store.get() // => {b: true, o: {z: {a: 1}}}

store.update({a: 'hey'}, 'z', store.get().o)
store.get() // => {b: true, o: {z: {a: 'hey'}}}
```


<a name="store-subscribe"></a>
### subscribe (action [, prop [, target]])

Subscribe an `action` to a `target` `property`

**Parameters:**
- **action** *function*: triggered with target as argument when prop changes
- **prop** *string*: Optional. Property name
- **target** *object*: Optional. Object which property will be watched

```js
store.subscribe(store.get(), 'b', target => console.log(target.b))
store.set('b', false)
// console prints `false`
```


<a name="store-prevState"></a>
### prevState ()

Undo last change in store

```js
store.get() //=> {b: true, o: {z: 42}}
store.set('b', false)
store.get() //=> {b: false, o: {z: 42}}
store.prevState()
store.get() //=> {b: true, o: {z: 42}}
```

<a name="store-nextState"></a>
### nextState ()

Redo change in store

```js
store.get() //=> {b: true, o: {z: 42}}
store.nextState()
store.get() //=> {b: false, o: {z: 42}}
```


<a name="store-getBox"></a>
### getBox (target)

Get a box from a target

**Parameters:**
- **target** *objec*: object which property will be watched

```js
let box = store.getBox(store.get().o)
box.get() //=> {z: 42}
console.log(box)
/* console prints:
  { get: [Function: get],
    set: [Function: set],
    update: [Function: update],
    subscribe: [Function: subscribe],
    getBox: [Function: getBox] }
*/
```


<a name="box-api"></a>
box API
-------

- [box.get](#box-get)
- [box.set](#box-set)
- [box.setIn](#box-setIn)
- [box.update](#box-update)
- [box.updateIn](#box-updateIn)
- [box.subscribe](#box-subscribe)
- [box.getBox](#box-getBox)

<a name="box-get"></a>
### get ()

Get the content of the box

**returns** *object*

```js
box.get() //=> {z: 42}
```


<a name="box-set"></a>
### set (key, content)

Set new content in content property

**Parameters:**
- **key** *string*: property name
- **content** *whatever*: new content

```js
box.set('s', 2)
box.get() // => {z: 2}}
```

<a name="box-update"></a>
### update (props)

Set multiple properties in box content. If a value is null the property will be deleted

**Parameters:**
- **props** *objec*: a list with properties and vales

```js
box.update({z: null, b: true})
box.get() // => {b: true}
```


<a name="box-subscribe"></a>
### subscribe (target, prop, action)

Same as [store.subscribe](#store-subscribe)


<a name="box-getBox"></a>
### getBox (target)

Same as [store.getBox](#store-getBox)

<br><br>

---

© 2016 [Jacobo Tabernero](https://github.com/jacoborus) - Released under [MIT License](https://raw.github.com/jacoborus/boxes/master/LICENSE)
