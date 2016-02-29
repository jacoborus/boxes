'use strict'

const test = require('tape')
const boxes = require('../boxes.js')

test('create default store', t => {
  let store = boxes()
  t.ok(store, 'create store')
  t.is(typeof store.get(), 'object', 'use default empty object')
  t.notOk(Object.keys(store.get()).length, 'use default empty object')
  t.end()
})

test('create store with given scope', t => {
  let scope = {a: 1}
  let store = boxes(scope)
  t.is(store.get(), scope, 'use given scope')

  scope.a = 2
  store.next()

  delete scope.a
  scope.b = 'boxes!'
  store.next()

  store.prevState()
  t.is(scope.a, 2, 'first prevState')
  t.notOk(scope.b, 'first prevState')

  store.prevState()
  t.is(scope.a, 1, 'second prevState')
  t.notOk(scope.b, 'second prevState')

  store.nextState()
  t.is(scope.a, 2, 'first nextState')
  t.notOk(scope.b, 'first nextState')

  store.nextState()
  t.notOk(scope.a, 'second nextState')
  t.is(scope.b, 'boxes!', 'second nextState')

  t.end()
})
