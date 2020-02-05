import test from 'tape'
import { Box, on, clear } from './boxes'

interface Msg {
  prop: string
  oldValue: any
}

test('emitter#set in object', t => {
  t.plan(2)
  const box = Box({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })
  box.a = 99
  clear(box)
  box.a = true
})

test('emitter#set in array', t => {
  t.plan(2)
  const box = Box([1, 2, 3, 4])
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, '2', 'default call on all properties')
    t.is(oldValue, 3, 'default call on all properties')
  })
  box['2'] = 99
  clear(box)
  box['2'] = true
})

test('emitter#set only triggers emitter if value is different', t => {
  t.plan(1)
  const box = Box([1, 2, 3, 4])
  on(box, () => t.pass())
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 99
  clear(box)
  box['2'] = true
})

test('emitter#delete in object', t => {
  t.plan(2)
  const box = Box({ a: 1, b: 2 })
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
  })
  delete box.a
  clear(box)
  delete box.b
})

test('emitter#delete in array', t => {
  t.plan(2)
  const box = Box([1, 2, 3, 4])
  on(box, ({ prop, oldValue }: Msg) => {
    t.is(prop, '2', 'default call on all properties')
    t.is(oldValue, 3, 'default call on all properties')
  })
  delete box['2']
  clear(box)
  delete box[0]
})

test('emitter#push in array', t => {
  t.plan(4)
  const box = Box([1, 2, 3, 4])
  // console.log(box)
  on(box, () => {
    t.pass()
  })
  box.push(999, 5, 6)
  console.log('len:', box.length)
  clear(box)
  box['2'] = true
  setTimeout(() => t.end(), 500)
})

test('emitter#pop in array', t => {
  // t.plan(11)
  const box = Box([1, 2, 3])
  // console.log(box)
  on(box, function () {
    console.log(arguments[0])
    t.pass()
  })
  box.shift()
  // box.push(1,2,3)
  console.log('======')
  console.log(box)
  console.log('======')
  clear(box)
  // box.pop()
  setTimeout(() => t.end(), 500)
})

// all array modifiers should be represented with 4 params:
// - replace
// - insert
// - remove
// - sort

// const arr = []
// const args = {
//   start: 1,
//   end: 2,
//   newItems: []
// }
//
// const mods = {
//   fill: 'auto', // replace (interception needed to return proxy)
//   pop: 'auto', // replace + length (no interception needed)
//   push: {
//     replace: [],
//     length: true // (interception needed to trigger length handlers)
//   },
//   shift: { // interception needed to trigger only 2 handlers:
//     remove: 0, // 0 is the index of the item to remove
//     length: true
//   },
//   reverse: {
//     sort: true,
//     length: false,
//     sort: true,
//     reverse: true
//   },
//   sort: {
//     diff: { start: 0, end: arr.length },
//     length: false,
//     sort: true
//   },
//   shift: 1,
//   unshift: 1,
//   splice: {},
//   copyWithin: 2
// }
