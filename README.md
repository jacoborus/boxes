Boxes
=====

Predictable state container for JavaScript apps

boxes API
---------

- [boxes.createStore](#boxes-createStore)
- [boxes.has](#boxes-has)
- [boxes.remove](#boxes-remove)


<a name="boxes-creatStore"></a>
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


store API
---------

- [store.get](#store-get)
- [store.set](#store-set)
- [store.setIn](#store-setIn)
- [store.update](#store-update)
- [store.updateIn](#store-updateIn)
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
### set (key, content)

Set new content in store property

**Parameters:**
- **key** *string*: property name
- **content** *whatever*: new content

```js
store.set('a', 2)
store.get() // => {a: 2, o: {x: 99}}
```


<a name="store-setIn"></a>
### setIn (target, key, content)

Set new content in target property

**Parameters:**
- **target** *object*: box that will be changed
- **key** *string*: property name of new content
- **content** *whatever*: new content

```js
store.setIn(store.get().o, 'x', 55)
store.get() // => {a: 2, o: {x: 55}
```


<a name="store-update"></a>
### update (props)

Set multiple properties in store. If a value is null the property will be deleted

**Parameters:**
- **props** *objec*: a list with properties and vales

```js
store.update({a: null, b: true})
store.get() // => {b: true, o: {x: 99}}
```


<a name="store-updateIn"></a>
### updateIn (target, props)

Set multiple properties in `target`. If a value is null the property will be deleted

**Parameters:**
- **target** *objec*: object which properties will be updated
- **props** *objec*: a list with properties and vales

```js
store.updateIn(store.get().o, {x: null, z: 42})
store.get() // => {b: true, o: {z: 42}}
```


<a name="store-subscribe"></a>
### subscribe (target, prop, action)

Subscribe an `action` to a `target` `property`

**Parameters:**
- **target** *objec*: object which property will be watched
- **prop** *string*: property name
- **action** *function*: triggered with target as argument when prop changes

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
    setIn: [Function: setIn],
    updateIn: [Function: updateIn],
    subscribe: [Function: subscribe],
    getBox: [Function: getBox] }
*/
```


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


<a name="box-setIn"></a>
### setIn (target, key, content)

Same as [store.setIn](#store-setIn)


<a name="box-update"></a>
### update (props)

Set multiple properties in box content. If a value is null the property will be deleted

**Parameters:**
- **props** *objec*: a list with properties and vales

```js
box.update({z: null, b: true})
box.get() // => {b: true}
```


<a name="box-updateIn"></a>
### updateIn (target, props)

Same as [store.updateIn](#store-updateIn)


<a name="box-subscribe"></a>
### subscribe (target, prop, action)

Same as [store.subscribe](#store-subscribe)


<a name="box-getBox"></a>
### getBox (target)

Same as [store.getBox](#store-getBox)
