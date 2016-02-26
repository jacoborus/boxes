'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

// CREATE STORE: OBJECT
test('boxes createStore: object', t => {
  let obj = {a: 1}
  let basicStore = boxes.createStore('basicStore', obj)
  t.is(basicStore.get(), obj)
  t.is(basicStore.get().a, 1)
  boxes.remove('basicStore')
  t.notOk(boxes.has('hasBox'), 'boxes is empty')

  boxes.createStore('hasBox', {a: 1, b: 2})
  t.ok(boxes.has('hasBox'), 'has store')
  boxes.remove('hasBox')
  t.notOk(boxes.has('hasBox'), 'remove store')

  let defaultStore = boxes.createStore('defaultStore')
  t.is(typeof defaultStore, 'object', 'create box')
  t.is(typeof defaultStore.get(), 'object', 'create default store object for box')
  t.is(Object.keys(defaultStore.get()).length, 0, 'create default empty store for box')
  boxes.remove('defaultStore')
  t.end()
})

// CREATE STORE: ARRAY
test('boxes createStore: array', t => {
  let arr = [{a: 1}, {a: 2}]
  let basicStore = boxes.createStore('arrayStore', arr)
  t.is(basicStore.get(), arr)
  t.is(basicStore.get()[0].a, 1)
  t.ok(boxes.has('arrayStore'), 'has store')
  boxes.remove('arrayStore')
  t.notOk(boxes.has('arrayStore'), 'boxes is empty')
  t.end()
})

// SET
test('set', t => {
  let control = 0
  let store = boxes.createStore('setbox', {a: 0})
  let unsubscribe = store.subscribe(store.get(), 'a', a => control = a)

  store.set('a', 1)
  t.is(store.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')

  store.set('a', 5)
  t.is(store.get().a, 5, 'basic set')
  t.is(control, 5, 'subscribe')

  store.prevState()
  t.is(store.get().a, 1, 'prevState')
  t.is(control, 1, 'subscribe')

  store.prevState()
  t.is(store.get().a, 0, 'prevState')
  t.is(control, 0, 'subscribe')

  store.nextState()
  t.is(store.get().a, 1, 'nextState')
  t.is(control, 1, 'subscribe')

  store.nextState()
  t.is(store.get().a, 5, 'nextState')
  t.is(control, 5, 'subscribe')

  unsubscribe()
  store.set('a', 99)
  t.is(control, 5, 'unsubscribe')
  t.is(store.get().a, 99, 'unsubscribe')
  boxes.remove('setbox')
  t.end()
})

// SET IN KEY
test('set in key', t => {
  let control = 0
  let store = boxes.createStore('setbox', {a: 0})
  let unsubscribe = store.subscribe(store.get(), 'a', a => control = a)

  store.set('a', 1)
  t.is(store.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')

  store.set('a', 5)
  t.is(store.get().a, 5, 'basic set')
  t.is(control, 5, 'subscribe')

  store.prevState()
  t.is(store.get().a, 1, 'prevState')
  t.is(control, 1, 'subscribe')

  store.prevState()
  t.is(store.get().a, 0, 'prevState')
  t.is(control, 0, 'subscribe')

  store.nextState()
  t.is(store.get().a, 1, 'nextState')
  t.is(control, 1, 'subscribe')

  store.nextState()
  t.is(store.get().a, 5, 'nextState')
  t.is(control, 5, 'subscribe')

  unsubscribe()
  store.set('a', 99)
  t.is(control, 5, 'unsubscribe')
  t.is(store.get().a, 99, 'unsubscribe')
  boxes.remove('setbox')
  t.end()
})

// SET IN TARGET
test('set in target', t => {
  let control = 0
  let store = boxes.createStore('setinbox', {o: {a: 99}})
  let unsubscribe = store.subscribe(store.get().o, 'a', a => control = a)

  store.setIn(1, 'a', store.get().o)
  t.is(store.get().o.a, 1, 'basic set')
  t.is(control, 1, 'subscribe')

  store.setIn(5, 'a', store.get().o)
  t.is(store.get().o.a, 5, 'basic setIn')
  t.is(control, 5, 'subscribe setIn')

  store.prevState()
  t.is(store.get().o.a, 1, 'prevState')
  t.is(control, 1, 'subscribe prevState')

  store.prevState()
  t.is(store.get().o.a, 99, 'prevState')
  t.is(control, 99, 'subscribe prevState')

  store.nextState()
  t.is(store.get().o.a, 1, 'nextState')
  t.is(control, 1, 'subscribe nextState')

  store.nextState()
  t.is(store.get().o.a, 5, 'nextState')
  t.is(control, 5, 'subscribe nextState')

  unsubscribe()
  store.setIn('xxx', 'a', store.get().o)
  t.is(control, 5, 'unsubscribe')

  boxes.remove('setinbox')
  t.end()
})

// UPDATE && UPDATE IN
test('update', t => {
  let control = {}
  let store = boxes.createStore('updatebox', {})
  let unsubscribeA = store.subscribe(store.get(), 'a', a => control.a = a)
  let unsubscribeB = store.subscribe(store.get(), 'b', b => control.b = b)

  store.update({a: 1})
  t.is(store.get().a, 1, 'basic update')
  t.is(control.a, 1, 'subscribe')
  t.notOk(control.b, 'subscribe')

  store.update({a: 5, b: 2})
  t.is(store.get().a, 5, 'multiple update')
  t.is(control.a, 5, 'subscribe')
  t.is(control.b, 2, 'subscribe')

  store.prevState()
  t.is(store.get().a, 1, 'prevState')
  t.is(control.a, 1, 'subscribe')
  t.notOk(control.b, 'subscribe')

  store.nextState()
  t.is(store.get().a, 5, 'nextState')
  t.is(control.a, 5, 'subscribe')
  t.is(control.b, 2, 'subscribe')

  unsubscribeA()
  unsubscribeB()
  store.update({a: 'xxx', b: 'yyy'})
  t.is(control.a, 5, 'unsubscribe')
  t.is(control.b, 2, 'subscribe')
  boxes.remove('updatebox')
  t.end()
})

// CLEAR OBJ
test('clear obj', t => {
  let control = true
  let store = boxes.createStore('clearObj', {o: {a: 99}})
  let unsubscribe = store.subscribe(store.get().o, 'a', a => control = a)
  t.ok(control, 'pre control')
  t.ok(Object.keys(store.get().o).length, ' pre clear')

  store.clear('o')
  t.notOk(Object.keys(store.get().o).length, 'clear')
  t.notOk(control, 'subcribe')

  store.setIn('hello', 'a', store.get().o)
  t.is(store.get().o.a, 'hello')
  t.is(control, 'hello', 'subcribe')

  store.prevState()
  t.notOk(Object.keys(store.get().o).length, 'clear')
  t.notOk(control, 'susbcribe')

  store.prevState()
  t.ok(Object.keys(store.get().o).length, 'prevState')
  t.is(control, 99, 'prevState subscription')

  unsubscribe()
  store.clear('o')
  t.is(control, 99, 'prevState subscription')

  boxes.remove('clearObj')
  t.end()
})

// GET BOX
test('set through box', t => {
  let control = 0
  let store = boxes.createStore('setbox', {o: {a: 1, b: 2, c: 3}})
  let box = store.getBox(store.get())
  let unsubscribe = box.subscribe(box.get(), 'a', a => control = a)
  box.set('a', 1)
  t.is(box.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  box.set('a', 5)
  t.is(box.get().a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  store.prevState()
  t.is(box.get().a, 1, 'prevState')
  store.nextState()
  t.is(box.get().a, 5, 'nextState')
  t.end()
  boxes.remove('setbox')
})

test.skip('merge obj')

test.skip('push array')
test.skip('set in array')
test.skip('update array')
test.skip('remove in array')
test.skip('clear array')
test.skip('pop array')
test.skip('shift array')
test.skip('unshift array')
test.skip('sort array')
test.skip('concat array')
test.skip('reverse array')
test.skip('splice array')
test.skip('splice into array')
