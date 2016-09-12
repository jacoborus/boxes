'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('boxes requires a state object', t => {
  t.throws(
    boxes,
    /boxes requires an object state/,
    'throws error when subscribing to scope outside the box'
  )
  t.end()
})

test('work with objects', t => {
  let state = {}
  let box = boxes(state)
  t.is(typeof box, 'object')

  // {}
  t.is(typeof state, 'object')
  t.is(Object.keys(state).length, 0)

  let a = 0
  box.on(() => ++a)
  state.a = 1
  state.o = {x: 'x'}
  let boxTest = box.save(state)
  // {a: 1, o: {x: 'x'}}
  t.is(a, 1, 'basic on')
  t.is(boxTest, box, 'save returns box')

  let x = 0
  box.on(state.o, () => ++x)
  state.o.x = 99
  box.save(state.o)
  // {a: 1, {x: 99}
  t.is(x, 1, 'subscribe inside object')

  delete state.a
  box.save()
  // {o: {x: 99}}
  t.is(a, 2)
  t.is(x, 1)

  box.undo()
  // {a: 1, o: {x: 99}
  t.is(state.a, 1, 'subscribe undo')
  t.is(state.o.x, 99, 'subscribe undo')

  box.undo()
  // {a: 1, o: {x: 'x'}}
  t.is(state.a, 1)
  t.is(state.o.x, 'x', 'subscribe undo')

  box.undo()
  // {}
  t.is(state.a, undefined)
  t.is(state.o, undefined)

  box.redo()
  // {a: 1, o: {x: 'x'}}
  t.is(state.o.x, 'x', 'subscribe undo')
  t.is(state.a, 1, 'subscribe undo')

  box.redo()
  // {a: 1, o: {x: 99}
  t.is(state.a, 1, 'subscribe undo')
  t.is(state.o.x, 99, 'subscribe undo')

  box.redo()
  // {o: {x: 99}}
  t.is(state.a, undefined)
  t.is(state.o.x, 99)

  box.undo(2)
  // {a: 1, o: {x: 'x'}}
  t.is(state.o.x, 'x', 'subscribe undo')
  t.is(state.a, 1, 'subscribe undo')

  box.redo(2)
  // {o: {x: 99}}
  t.is(state.a, undefined)
  t.is(state.o.x, 99)

  t.end()
})

test('throw when subscribing to a object a scope that is not in the box', t => {
  let box = boxes({})
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

test('off', t => {
  let control = 0
  let scope = {
    a: 1
  }
  let box = boxes(scope)
  const fn = () => ++control
  box.on(fn)
  box.emit()
  t.is(control, 1)
  scope.a = 2
  box.off(fn)
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

// TODO:
// - reenable log
// - limit history (through options at create time)
// - travel to a instant in time without undo or redo
// - flat group of stories into one
