'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('work with objects', t => {
  let box = boxes()
  t.is(typeof box, 'object')

  let scope = box.get()
  // {}
  t.is(typeof scope, 'object')
  t.is(Object.keys(scope).length, 0)

  let a = 0
  box.on(() => ++a)
  scope.a = 1
  scope.o = {x: 'x'}
  let boxTest = box.save(scope)
  // {a: 1, o: {x: 'x'}}
  t.is(a, 1, 'basic on')
  t.is(boxTest, box, 'save returns box')

  let x = 0
  box.on(scope.o, () => ++x)
  scope.o.x = 99
  box.save(scope.o)
  // {a: 1, {x: 99}
  t.is(x, 1, 'subscribe inside object')

  delete scope.a
  box.save()
  // {o: {x: 99}}
  t.is(a, 2)
  t.is(x, 1)

  box.undo()
  // {a: 1, o: {x: 99}
  t.is(scope.a, 1, 'subscribe undo')
  t.is(scope.o.x, 99, 'subscribe undo')

  box.undo()
  // {a: 1, o: {x: 'x'}}
  t.is(scope.a, 1)
  t.is(scope.o.x, 'x', 'subscribe undo')

  box.undo()
  // {}
  t.is(scope.a, undefined)
  t.is(scope.o, undefined)

  box.redo()
  // {a: 1, o: {x: 'x'}}
  t.is(scope.o.x, 'x', 'subscribe undo')
  t.is(scope.a, 1, 'subscribe undo')

  box.redo()
  // {a: 1, o: {x: 99}
  t.is(scope.a, 1, 'subscribe undo')
  t.is(scope.o.x, 99, 'subscribe undo')

  box.redo()
  // {o: {x: 99}}
  t.is(scope.a, undefined)
  t.is(scope.o.x, 99)

  box.undo(2)
  // {a: 1, o: {x: 'x'}}
  t.is(scope.o.x, 'x', 'subscribe undo')
  t.is(scope.a, 1, 'subscribe undo')

  box.redo(2)
  // {o: {x: 99}}
  t.is(scope.a, undefined)
  t.is(scope.o.x, 99)

  t.end()
})

test('throw when subscribing to a object a scope that is not in the box', t => {
  let box = boxes()
  t.throws(() => box.on({}, () => 1), 'throws error when subscribing to scope outside the box')
  t.end()
})

test('emit', t => {
  let control = 0
  let scope = {
    a: 1
  }
  let box = boxes(scope)
  box.on(() => ++control)
  let boxTest = box.emit()
  t.is(control, 1)
  t.is(boxTest, box, 'emit returns box')
  t.end()
})

test('unsubscribe', t => {
  let control = 0
  let scope = {
    a: 1
  }
  let box = boxes(scope)
  let unsubscribe = box.on(() => ++control)
  box.emit()
  t.is(control, 1)
  scope.a = 2
  unsubscribe()
  box.emit()
  t.is(control, 1)
  t.end()
})

test('work with arrays', t => {
  let x = 0
  let scope = {
    a: []
  }
  let box = boxes(scope)
  // {}
  t.is(box.get().a, scope.a)
  t.is(Object.keys(scope).length, 1)

  scope.a.push(1)
  box.on(scope.a, () => ++x)
  box.save(scope.a)
  // {a: [1]}
  t.is(x, 1, 'basic subscribe')

  let z = {z: 1}
  scope.a[1] = z
  box.save(scope.a)
  // {a: [1, {z: 1}]}
  t.is(x, 2, 'subscribe inside object')

  scope.a.shift()
  box.save(scope.a)
  // {a: [{z: 1}]}
  t.is(x, 3)

  box.undo()
  // {a: [1, {z: 1}]}
  t.is(x, 4)
  t.is(scope.a[0], 1, 'subscribe undo')
  t.ok(scope.a[1], 1, 'subscribe undo')
  t.is(scope.a[1].z, 1, 'subscribe undo')

  box.undo()
  // {a: [1]}
  t.is(x, 5, 'subscribe undo')
  t.is(scope.a.length, 1, 'subscribe undo')
  t.notOk(scope.a[1], 'subscribe undo')

  box.undo()
  // // {a: []}
  t.is(x, 6, 'subscribe undo')
  t.is(scope.a.length, 0, 'subscribe undo')

  box.redo()
  // {a: [1]}
  t.is(x, 7, 'subscribe redo')
  t.is(scope.a.length, 1, 'subscribe redo')
  t.is(scope.a[0], 1, 'subscribe redo')
  t.notOk(scope.a[1], 'subscribe redo')

  box.redo()
  // {a: [1, {z: 1}]}
  t.is(x, 8, 'subscribe redo')
  t.is(scope.a.length, 2, 'subscribe redo')
  t.is(scope.a[0], 1, 'subscribe redo')
  t.ok(scope.a[1], 'subscribe redo')
  t.is(scope.a[1].z, 1, 'subscribe redo')

  box.redo()
  // {a: [{z: 1}]}
  t.is(x, 9, 'subscribe redo')
  t.is(scope.a.length, 1, 'subscribe redo')
  t.is(scope.a[0].z, 1, 'subscribe redo')

  box.undo(2)
  // {a: [1]}
  t.is(x, 11, 'undo 2 steps')
  t.is(scope.a.length, 1, 'subscribe undo 2 steps')
  t.is(scope.a[0], 1, 'subscribe redo')

  box.redo(2)
  // {a: [{z: 1}]}
  t.is(x, 13, 'undo 2 steps')
  t.is(scope.a.length, 1, 'subscribe undo 2 steps')
  t.is(scope.a[0].z, 1, 'subscribe redo')

  t.end()
})

test('log, records and get now', t => {
  let state = {a: 1}
  let box = boxes(state)
  t.is(box.now(), 0, 'initial now')
  t.notOk(isNaN(box.records[0]), 'default log is time')

  box.log('initial state')
  t.is(box.now(), 0, 'initial now')
  t.is(box.records[0], 'initial state')

  state.a = 2
  box.save().log('a is 2')
  t.is(box.now(), 1, 'initial now')
  t.is(box.records[1], 'a is 2')

  state.b = true
  box.save()
  t.is(box.now(), 2, 'initial now')
  t.is(box.records.length, 3, 'keep records count')

  box.undo(2)
  state.b = false
  t.is(box.now(), 0, 'undo now')
  box.save()
  t.is(box.now(), 1, 'now re save')
  t.is(box.records.length, 2, 'delete future records when save')

  t.end()
})

test('apply now', t => {
  const state = {a: 1}
  const box = boxes(state)
  state.a = 2
  box.save()
  state.b = true
  box.save()
  box.now(0)
  t.is(box.now(), 0)
  t.end()
})

test('off', t => {
  const state = {a: 1}
  const box = boxes(state)
  let control = 0
  const fn = () => control++
  box.on(fn)
  box.emit()
  t.is(control, 1)
  box.off(state, fn)
  box.emit()
  t.is(control, 1)
  t.end()
})
