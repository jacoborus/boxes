'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('work with objects', t => {
  let a = 0
  let x = 0
  let box = boxes()
  t.is(typeof box, 'object')

  let scope = box.get()
  // {}
  t.is(typeof scope, 'object')
  t.is(Object.keys(scope).length, 0)

  box.subscribe(obj => {a = obj.a})
  scope.a = 1
  scope.o = {x: 'x'}
  box.save()
  // {a: 1, o: {x: 'x'}}
  t.is(a, 1, 'basic subscribe')

  box.subscribe(obj => {x = obj.x}, scope.o)
  scope.o.x = 99
  box.save(scope.o)
  // {a: 1, {x: 99}
  t.is(x, 99, 'subscribe inside object')

  delete scope.a
  box.save()
  // {o: {x: 99}}
  t.is(a, undefined)
  t.is(x, 99)

  box.undo()
  // {a: 1, o: {x: 99}
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe undo')

  box.undo()
  // {a: 1, o: {x: 'x'}}
  t.is(x, 'x')
  t.is(scope.o.x, 'x', 'subscribe undo')

  box.undo()
  // {}
  t.is(scope.a, undefined)
  t.is(a, undefined)

  box.redo()
  // {a: 1, o: {x: 'x'}}
  t.is(x, 'x')
  t.is(scope.o.x, 'x', 'subscribe undo')
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe undo')

  box.redo()
  // {a: 1, o: {x: 99}
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe undo')
  t.is(x, 99)
  t.is(scope.o.x, 99, 'subscribe undo')

  box.redo()
  // {o: {x: 99}}
  t.is(a, undefined)
  t.is(scope.a, undefined)
  t.is(x, 99)
  t.is(scope.o.x, 99)

  t.end()
})

test('throw when subscribing to a object a scope that is not in the box', t => {
  let box = boxes()
  t.throws(() => box.subscribe(() => 1, {}), 'throws error when subscribing to scope outside the box')
  t.end()
})

test('trigger', t => {
  let control = 0
  let scope = {
    a: 1
  }
  let box = boxes(scope)
  box.subscribe(s => {control = s.a})
  box.trigger()
  t.is(control, 1)
  t.end()
})

test('unsubscribe', t => {
  let control = 0
  let scope = {
    a: 1
  }
  let box = boxes(scope)
  let unsubscribe = box.subscribe(s => {control = s.a})
  box.trigger()
  t.is(control, 1)
  scope.a = 2
  unsubscribe()
  box.trigger()
  t.is(control, 1)
  t.end()
})

test('work with arrays', t => {
  let x0, x1
  let scope = {
    a: []
  }
  let box = boxes(scope)
  // {}
  t.is(box.get().a, scope.a)
  t.is(Object.keys(scope).length, 1)

  scope.a.push(1)
  box.subscribe(obj => {
    x0 = obj[0]
    x1 = obj[1]
  }, scope.a)
  box.save(scope.a)
  // {a: [1]}
  t.is(x0, 1, 'basic subscribe')
  t.notOk(x1, 'basic subscribe')

  let z = {z: 1}
  scope.a[1] = z
  box.save(scope.a)
  // {a: [1, {z: 1}]}
  t.is(x0, 1, 'subscribe inside object')
  t.is(x1, z, 'subscribe inside object')

  scope.a.shift()
  box.save(scope.a)
  // {a: [{z: 1}]}
  t.is(x0, z)

  box.undo()
  // {a: [1, {z: 1}]}
  t.is(x0, 1, 'subscribe undo')
  t.is(x1, z, 'subscribe undo')

  box.undo()
  // {a: [1]}
  t.is(x0, 1, 'subscribe undo')
  t.is(scope.a.length, 1, 'subscribe undo')
  t.notOk(x1, 'subscribe undo')

  box.undo()
  // // {a: []}
  t.notOk(x0, 'subscribe undo')
  t.notOk(x1, 'subscribe undo')
  t.is(scope.a.length, 0, 'subscribe undo')

  box.redo()
  // {a: [1]}
  t.is(x0, 1, 'subscribe redo')
  t.is(scope.a.length, 1, 'subscribe redo')
  t.notOk(x1, 'subscribe redo')

  box.redo()
  // {a: [1, {z: 1}]}
  t.is(x0, 1, 'subscribe redo')
  t.is(x1, z, 'subscribe redo')

  box.redo()
  // {a: [{z: 1}]}
  t.is(x0, z)

  t.end()
})
