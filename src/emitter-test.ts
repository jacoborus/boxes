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

test('Modifiers#fill', t => {
  t.plan(7)
  const arr = [1, 2, 3]
  const list1 = Box(arr)
  const list2 = Box(arr)
  const list3 = Box(arr)
  const list4 = Box(arr)
  const list5 = Box(arr)
  const list6 = Box(arr)
  const list7 = Box(arr)
  const list8 = Box(arr)
  const res1 = [
    ['set', 0, 1, 4],
    ['set', 1, 2, 4],
    ['set', 2, 3, 4]
  ]
  on(list1, change => t.same(res1.shift(), change))
  list1.fill(4) // [4, 4, 4]

  const res2 = [
    ['set', 1, 2, 4],
    ['set', 2, 3, 4]
  ]
  on(list2, change => t.same(res2.shift(), change))
  list2.fill(4, 1) // [1, 4, 4]

  const res3 = [
    ['set', 1, 2, 4]
  ]
  on(list3, change => t.same(res3.shift(), change))
  list3.fill(4, 1, 2) // [1, 4, 3]

  on(list4, () => t.fail())
  list4.fill(4, 1, 1) // [1, 2, 3]

  on(list5, () => t.fail())
  list5.fill(4, 3, 3) // [1, 2, 3]

  const res6 = [
    ['set', 0, 1, 4]
  ]
  on(list6, change => t.same(res6.shift(), change))
  list6.fill(4, -3, -2) // [4, 2, 3]

  on(list7, () => t.fail())
  list7.fill(4, NaN, NaN) // [1, 2, 3]

  on(list8, () => t.fail())
  list8.fill(4, 3, 5) // [1, 2, 3]
  setTimeout(() => t.end(), 50)
})

test('emitter#pop', t => {
  t.plan(2)
  const plants = ['broccoli', 'cauliflower', 'cabbage', 'kale', 'tomato']
  const results = [
    ['remove', 4, 'tomato'],
    ['remove', 3, 'kale']
  ]
  const list = Box(plants)
  on(list, change => t.same(change, results.shift()))
  list.pop() // "tomato"
  list.pop()
  t.end()
})

test('emitter#push', t => {
  const animals = ['pigs', 'goats', 'sheep']
  const list = Box(animals)
  const results = [
    ['insert', 3, 'cows'],
    ['length', 4],
    ['insert', 4, 'chickens'],
    ['insert', 5, 'cats'],
    ['insert', 6, 'dogs'],
    ['length', 7]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.push('cows')
  list.push('chickens', 'cats', 'dogs')
  t.end()
})

test('emitter#reverse', t => {
  t.plan(1)
  const arr = ['one', 'two', 'three']
  const list = Box(arr)
  const result = ['reverse']
  on(list, change => t.same(change, result))
  list.reverse()
  t.end()
})

test('emitter#shift', t => {
  const arr = [1, 2, 3]
  const list = Box(arr)
  const results = [
    ['remove', 0, 1],
    ['length', 2]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.shift()
  t.end()
})

test.skip('emitter#sort', t => t.end())
test.skip('emitter#splice', t => t.end())

test('emitter#unshift', t => {
  const arr = [1, 2, 3]
  const list = Box(arr)
  const results = [
    ['insert', 0, 5],
    ['insert', 0, 4],
    ['length', 5]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.unshift(4, 5)
  t.end()
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
