'use strict'

const test = require('tape')
const createBox = require('../boxes.js')

test('create box', t => {
  let box = createBox('mybox', {a: 1})
  t.is(box.getState('a'), 1, 'set initial state')
  box.update({b: 2})
  t.is(box.getState('b'), 2, 'basic update')
  let control = 0
  box.subscribe(box.getState(), 'c', () => control++)
  box.update({c: 3})
  box.update({c: 4})
  box.update({c: 3})
  t.is(box.getState('c'), 3, 'multiple update')
  t.is(control, 3, 'subscribe')
  box.prevState()
  box.prevState()
  box.prevState()
  t.notOk(box.getState('c'), 'prevState')
  t.is(box.getState('b'), 2, 'prevState')
  box.nextState()
  box.nextState()
  box.nextState()
  t.is(box.getState('c'), 4, 'nextState')
  t.end()
})
