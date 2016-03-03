'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('create default box', t => {
  let a = 0
  let x = 0
  let box = boxes()
  t.is(typeof box, 'object')

  let scope = box.get()
  // {}
  t.is(typeof scope, 'object')
  t.is(Object.keys(scope).length, 0)

  box.subscribe(obj => a = obj.a)
  scope.a = 1
  scope.o = {x: 'x'}
  box.save()
  // {a: 1, o: {x: 'x'}}
  t.is(a, 1, 'basic subscribe')

  box.subscribe(obj => x = obj.x, scope.o)
  scope.o.x = 99
  box.save(scope.o)
  // {a: 1, {x: 99}
  t.is(x, 99, 'subscribe inside object')

  delete scope.a
  box.save()
  // {o: {x: 99}}
  t.is(a, undefined)
  t.is(x, 99)

  box.prevState()
  // {a: 1, o: {x: 99}
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe prevState')

  box.prevState()
  // {a: 1, o: {x: 'x'}}
  t.is(x, 'x')
  t.is(scope.o.x, 'x', 'subscribe prevState')

  box.prevState()
  // {}
  t.is(scope.a, undefined)
  t.is(a, undefined)

  box.nextState()
  // {a: 1, o: {x: 'x'}}
  t.is(x, 'x')
  t.is(scope.o.x, 'x', 'subscribe prevState')
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe prevState')

  box.nextState()
  // {a: 1, o: {x: 99}
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe prevState')
  t.is(x, 99)
  t.is(scope.o.x, 99, 'subscribe prevState')

  box.nextState()
  // {o: {x: 99}}
  t.is(a, undefined)
  t.is(scope.a, undefined)
  t.is(x, 99)
  t.is(scope.o.x, 99)

  t.end()
})
