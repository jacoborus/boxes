'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const { Box, set, on, off } = Boxes

test('emitter#set in object', t => {
  t.plan(3)
  const box = new Box({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  on(box, ({ prop, oldValue }) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })
  set(box, 'a', 99)
  off(box)
  set(box, 'a', true)
  t.pass('ok off')
})

test('emitter#set in array', t => {
  t.plan(3)
  const box = new Box([1, 2, 3, 4])
  on(box, ({ prop, oldValue }) => {
    t.is(prop, '2', 'default call on all properties')
    t.is(oldValue, 3, 'default call on all properties')
  })
  set(box, '2', 99)
  off(box)
  set(box, '2', true)
  t.pass('ok off')
})

test('emitter#set only triggers emitter if value is different', t => {
  t.plan(2)
  const box = new Box([1, 2, 3, 4])
  on(box, () => t.pass())
  set(box, '0', 1)
  set(box, '0', 1)
  set(box, '0', 1)
  set(box, '0', 1)
  set(box, '0', 99)
  off(box)
  set(box, '2', true)
  t.pass('ok off')
})
