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

// REPLACE
test('replace', t => {
  let control = 0
  let store = boxes.createStore('replaceBox', {a: 0})
  let unsubscribe = store.subscribeToStore(s => control = s)

  // t.throws(function () {
  //   store.set(1)
  // }, 'trying to replace a box with a non object value', 'requires object')

  // t.throws(function () {
  //   store.set([])
  // }, 'replace requires same kind of store', 'requires same type of store')

  store.set({b: 2})
  t.is(store.get().b, 2, 'basic set')
  t.is(control.b, 2, 'subscribe')

  store.set({b: 5})
  t.is(store.get().b, 5, 'basic set')
  t.is(control.b, 5, 'subscribe')

  store.prevState()
  t.is(store.get().b, 2, 'prevState')
  t.is(control.b, 2, 'subscribe')

  store.prevState()
  t.is(store.get().a, 0, 'prevState')
  t.is(control.a, 0, 'subscribe')

  store.nextState()
  t.is(store.get().b, 2, 'nextState')
  t.is(control.b, 2, 'subscribe')

  store.nextState()
  t.is(store.get().b, 5, 'nextState')
  t.is(control.b, 5, 'subscribe')

  unsubscribe()
  store.set({c: 99})
  t.is(control.b, 5, 'unsubscribe')
  t.notOk(control.c, 'unsubscribe')
  t.is(store.get().c, 99, 'unsubscribe')
  boxes.remove('replaceBox')
  t.end()
})

// SET IN KEY
test('setIn', t => {
  let control = 0
  let store = boxes.createStore('setbox', {a: 0})
  let unsubscribe = store.subscribe(store.get(), 'a', a => {
    control = a
  })

  store.set(1, 'a')
  t.is(store.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')

  store.set(5, 'a')
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
  store.set(99, 'a')
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

  store.set(1, 'a', store.get().o)
  t.is(store.get().o.a, 1, 'basic set')
  t.is(control, 1, 'subscribe')

  store.set(5, 'a', store.get().o)
  t.is(store.get().o.a, 5, 'basic set')
  t.is(control, 5, 'subscribe set')

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
  store.set('xxx', 'a', store.get().o)
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

// GET BOX
test('setIn through box', t => {
  let control = 0
  let store = boxes.createStore('setbox', {o: {a: 1, b: 2, c: 3}})
  let box = store.getBox(store.get())
  let unsubscribe = box.subscribe(box.get(), 'a', a => control = a)
  box.set(1, 'a')
  t.is(box.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  box.set(5, 'a')
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
test.skip('remove in array')
test.skip('clear array')
test.skip('pop array')
test.skip('shift array')
test.skip('unshift array')
test.skip('sort array')
test.skip('reverse array')
test.skip('splice array')
