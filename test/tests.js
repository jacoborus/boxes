'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

// BOXES
test('boxes', t => {
  let obj = {a: 1}
  let basicBox = boxes.createBox('basicBox', obj)
  t.is(basicBox.get(), obj)
  t.is(basicBox.get().a, 1)
  boxes.remove('basicBox')
  t.notOk(boxes.has('hasBox'), 'boxes is empty')

  boxes.createBox('hasBox', {a: 1, b: 2})
  t.ok(boxes.has('hasBox'), 'has box')
  boxes.remove('hasBox')
  t.notOk(boxes.has('hasBox'), 'remove box')

  let defaultBox = boxes.createBox('defaultBox')
  t.is(typeof defaultBox, 'object', 'create box')
  t.is(typeof defaultBox.get(), 'object', 'create default store object for box')
  t.is(Object.keys(defaultBox.get()).length, 0, 'create default empty store for box')
  boxes.remove('defaultBox')
  t.end()
})

// SET
test('set', t => {
  let control = 0
  let box = boxes.createBox('setbox', {})
  let unsubscribe = box.subscribe(box.get(), 'a', o => control = o.a)
  box.set('a', 1)
  t.is(box.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  box.set('a', 5)
  t.is(box.get().a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  box.prevState()
  t.is(box.get().a, 1, 'prevState')
  box.nextState()
  t.is(box.get().a, 5, 'nextState')
  t.end()
  boxes.remove('setbox')
})

// SET IN
test('set in', t => {
  let control = 0
  let box = boxes.createBox('setinbox', {o: {a: 99}})
  let unsubscribe = box.subscribe(box.get().o, 'a', o => control = o.a)
  box.setIn(box.get().o, 'a', 1)
  t.is(box.get().o.a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  box.setIn(box.get().o, 'a', 5)
  t.is(box.get().o.a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  box.prevState()
  t.is(box.get().o.a, 1, 'prevState')
  box.prevState()
  t.is(box.get().o.a, 99, 'prevState')
  box.nextState()
  t.is(box.get().o.a, 1, 'nextState')
  boxes.remove('setinbox')
  t.end()
})

// UPDATE && UPDATE IN
test('update', t => {
  let control = 0
  let box = boxes.createBox('updatebox', {})
  let unsubscribe = box.subscribe(box.get(), 'a', o => control = o.a)
  box.update({a: 1})
  t.is(box.get().a, 1, 'basic set')
  t.is(control, 1, 'subscribe')
  unsubscribe()
  box.update({a: 5, b: 2})
  t.is(box.get().a, 5, 'basic set')
  t.is(control, 1, 'unsubscribe')
  box.prevState()
  t.is(box.get().a, 1, 'prevState')
  box.nextState()
  t.is(box.get().a, 5, 'nextState')
  t.end()
  boxes.remove('updatebox')
})
