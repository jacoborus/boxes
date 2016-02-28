'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

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

test('replace', t => {
  let control = 0
  let store = boxes.createStore('replaceBox', {a: 0})
  let unsubscribe = store.subscribe(s => control = s)

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

test('setIn', t => {
  let control = 0
  let store = boxes.createStore('setbox', {a: 0})
  let unsubscribe = store.subscribe(a => control = a, 'a')

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

test('set in target', t => {
  let control = 0
  let store = boxes.createStore('setinbox', {o: {a: 99}})
  let unsubscribe = store.subscribe(a => control = a, 'a', store.get().o)

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

test('update simple', t => {
  let control = {}
  let store = boxes.createStore('updatebox', {})
  let unsubscribeA = store.subscribe(a => control.a = a, 'a')
  let unsubscribeB = store.subscribe(b => control.b = b, 'b')

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

test('update in key', t => {
  let control = {}
  let store = boxes.createStore('updateinkey', {o: {a: 'x'}})
  let unsubscribeA = store.subscribe(a => control.a = a, 'a', store.get().o)
  let unsubscribeB = store.subscribe(b => control.b = b, 'b', store.get().o)

  store.update({a: 1}, 'o')
  t.is(store.get().o.a, 1, 'basic update')
  t.is(control.a, 1, 'subscribe')
  t.notOk(control.b, 'subscribe')

  store.update({a: 5, b: 2}, 'o')
  t.is(store.get().o.a, 5, 'multiple update')
  t.is(store.get().o.b, 2, 'multiple update')
  t.is(control.a, 5, 'subscribe')
  t.is(control.b, 2, 'subscribe')

  store.prevState()
  t.is(store.get().o.a, 1, 'prevState')
  t.notOk(store.get().o.b, 'prevState')
  t.is(control.a, 1, 'subscribe')
  t.notOk(control.b, 'subscribe')

  store.nextState()
  t.is(store.get().o.a, 5, 'nextState')
  t.is(control.a, 5, 'subscribe')
  t.is(control.b, 2, 'subscribe')

  unsubscribeA()
  unsubscribeB()
  store.update({a: 'xxx', b: 'yyy'}, 'o')
  t.is(control.a, 5, 'unsubscribe')
  t.is(control.b, 2, 'subscribe')
  boxes.remove('updateinkey')
  t.end()
})

test('getBox', t => {
  let control = 0
  let store = boxes.createStore('setbox', {o: {a: 1, b: 2, c: 3}})
  let box = store.getBox('o')
  let unsubscribe = box.subscribe(a => control = a, 'a')
  box.set(99, 'a')
  t.is(box.get().a, 99, 'basic set')
  t.is(control, 99, 'subscribe')
  unsubscribe()
  box.set(5, 'a')
  t.is(box.get().a, 5, 'basic set')
  t.is(control, 99, 'unsubscribe')
  store.prevState()
  t.is(box.get().a, 99, 'prevState')
  store.nextState()
  t.is(box.get().a, 5, 'nextState')
  t.end()
  boxes.remove('setbox')
})
