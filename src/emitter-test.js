'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const {
  Box, set, on
} = Boxes

test('emitter#on', t => {
  t.plan(2)
  const box = new Box({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  on(box, (prop, oldValue) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })

  set(box, 'a', 99)
})
