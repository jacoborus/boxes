'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('create default box', t => {
  let a = 0
  let x = 0
  let box = boxes()
  t.is(typeof box, 'object')

  let scope = box.get()
  t.is(typeof scope, 'object')
  t.is(Object.keys(scope).length, 0)

  box.subscribe(obj => a = obj.a)
  scope.a = 1
  scope.o = {x: 'x'}
  box.save()
  t.is(a, 1, 'basic subscribe')

  box.subscribe(obj => x = obj.x, scope.o)
  scope.o.x = 99
  box.save(scope.o)
  t.is(x, 99, 'subscribe inside object')

  delete scope.a
  box.save()
  t.is(a, undefined)
  t.is(x, 99)

  box.prevState()
  t.is(a, 1)
  t.is(scope.a, 1, 'subscribe prevState')

  box.prevState()
  t.is(x, 'x')
  t.is(scope.o.x, 'x', 'subscribe prevState')

  box.prevState()
  t.is(x, 'x')
  t.is(scope.a, undefined)

  // box.nextState()
  // t.is(a, 1)
  // t.is(scope.a, 1, 'subscribe prevState')

  t.end()
})
