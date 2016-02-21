'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

// BOXES
test('boxes', t => {
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

// SET
test('set', t => {
  let control = 0
  let store = boxes.createStore('setbox', {})
  let unsubscribe = store.subscribe(store.get(), 'a', o => control = o.a)
  store.set('a', 1)
  t.is(store.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  store.set('a', 5)
  t.is(store.get().a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  store.prevState()
  t.is(store.get().a, 1, 'prevState')
  store.nextState()
  t.is(store.get().a, 5, 'nextState')
  t.end()
  boxes.remove('setbox')
})

// SET IN
test('set in', t => {
  let control = 0
  let store = boxes.createStore('setinbox', {o: {a: 99}})
  let unsubscribe = store.subscribe(store.get().o, 'a', o => control = o.a)
  store.setIn(store.get().o, 'a', 1)
  t.is(store.get().o.a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  store.setIn(store.get().o, 'a', 5)
  t.is(store.get().o.a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  store.prevState()
  t.is(store.get().o.a, 1, 'prevState')
  store.prevState()
  t.is(store.get().o.a, 99, 'prevState')
  store.nextState()
  t.is(store.get().o.a, 1, 'nextState')
  boxes.remove('setinbox')
  t.end()
})

// UPDATE && UPDATE IN
test('update', t => {
  let control = 0
  let store = boxes.createStore('updatebox', {})
  let unsubscribe = store.subscribe(store.get(), 'a', o => control = o.a)
  store.update({a: 1})
  t.is(store.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  store.update({a: 5, b: 2})
  t.is(store.get().a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  store.prevState()
  t.is(store.get().a, 1, 'prevState')
  store.nextState()
  t.is(store.get().a, 5, 'nextState')
  t.end()
  boxes.remove('updatebox')
})

test.skip('stash store') // useful when you need to save subscriptions

// test subscribe, unsubscribe, prev and next state
// in every one of the following tests
test.skip('remove in obj')
test.skip('clear obj')
test.skip('update obj')
test.skip('merge obj')

test.skip('set in array')
test.skip('update array')
test.skip('remove in array')
test.skip('clear array')
test.skip('push array')
test.skip('pop array')
test.skip('shift array')
test.skip('unshift array')
test.skip('sort array')
test.skip('concat array')
test.skip('reverse array')
test.skip('splice array')
test.skip('splice into array')
