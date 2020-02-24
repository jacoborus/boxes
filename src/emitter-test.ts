import test from 'tape'
import { getBox, on, off } from './boxes'

test('emitter#set in object', t => {
  const box = getBox({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  const results = [
    ['set', 1, 99]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, 'a', handler)
  box.a = 99
  off(box, 'a', handler)
  box.a = true
  t.end()
})

test('emitter#delete in object', t => {
  const box = getBox({ a: 1, b: 2 })
  const results = [
    ['delete', 1],
    ['delete', 2]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, 'a', handler)
  on(box, 'b', handler)
  delete box.a
  delete box.b
  t.end()
})

test('emitter#set in array', t => {
  const box = getBox([1, 2, 3, 4])
  const results = [
    ['set', 3, 99]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  box['2'] = 99
  off(box, '2', handler)
  box['2'] = true
  t.end()
})

test('emitter#set only triggers emitter if value is different', t => {
  t.plan(1)
  const box = getBox([1, 2, 3, 4])
  const handler = () => t.pass()
  on(box, '0', handler)
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 1
  box[0] = 99
  off(box, '0', handler)
  box['2'] = true
  t.end()
})

test('emitter#delete in array', t => {
  const box = getBox([1, 2, 3, 4])
  const results = [
    ['delete', 2]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '1', handler)
  delete box['1']
  off(box, '1', handler)
  delete box[1]
  t.end()
})

test('emitter#copyWithin', t => {
  const original = [1, 2, 3, 4, 5]
  const list1 = getBox(original)
  const list2 = getBox(original)
  const list3 = getBox(original)
  const list4 = getBox(original)
  t.plan(7)
  const results1 = [
    ['set', 4, 1],
    ['set', 5, 2]
  ]
  const handler1 = (...change: []) => t.same(change, results1.shift(), '::1')
  on(list1, '3', handler1)
  on(list1, '4', handler1)
  // [1, 2, 3, 1, 2]
  list1.copyWithin(-2)

  const results2 = [
    ['set', 1, 4],
    ['set', 2, 5]
  ]
  // [4, 5, 3, 4, 5]
  const handler2 = (...change: []) => t.same(change, results2.shift(), '::2')
  on(list2, '0', handler2)
  on(list2, '1', handler2)
  list2.copyWithin(0, 3)

  const results3 = [
    ['set', 1, 4]
  ]
  const handler3 = (...change: []) => t.same(change, results3.shift(), '::3')
  on(list3, '0', handler3)
  // [4, 2, 3, 4, 5]
  list3.copyWithin(0, 3, 4)

  const results4 = [
    ['set', 4, 3],
    ['set', 5, 4]
  ]
  const handler4 = (...change: []) => t.same(change, results4.shift(), '::4')
  on(list4, '3', handler4)
  on(list4, '4', handler4)
  // [1, 2, 3, 3, 4]
  list4.copyWithin(-2, -3, -1)
  t.end()
})

test('emitter#fill', t => {
  t.plan(7)
  const arr = [1, 2, 3]
  const list1 = getBox(arr)
  const list2 = getBox(arr)
  const list3 = getBox(arr)
  const list4 = getBox(arr)
  const list5 = getBox(arr)
  const list6 = getBox(arr)
  const list7 = getBox(arr)
  const list8 = getBox(arr)
  const res1 = [
    ['set', 1, 4],
    ['set', 2, 4],
    ['set', 3, 4]
  ]
  const handler1 = (...change: []) => t.same(res1.shift(), change, ':::1')
  on(list1, '0', handler1)
  on(list1, '1', handler1)
  on(list1, '2', handler1)
  list1.fill(4) // [4, 4, 4]

  const res2 = [
    ['set', 2, 4],
    ['set', 3, 4]
  ]
  const handler2 = (...change: []) => t.same(res2.shift(), change, ':::2')
  on(list2, '1', handler2)
  on(list2, '2', handler2)
  list2.fill(4, 1) // [1, 4, 4]

  const res3 = [
    ['set', 2, 4]
  ]
  const handler3 = (...change: []) => t.same(res3.shift(), change, ':::3')
  on(list3, '1', handler3)
  list3.fill(4, 1, 2) // [1, 4, 3]

  on(list4, '0', () => t.fail(':::4'))
  list4.fill(4, 1, 1) // [1, 2, 3]

  on(list5, '0', () => t.fail(':::5'))
  list5.fill(4, 3, 3) // [1, 2, 3]

  const res6 = [
    ['set', 1, 4]
  ]
  const handler6 = (...change: []) => t.same(res6.shift(), change, ':::6')
  on(list6, '0', handler6)
  list6.fill(4, -3, -2) // [4, 2, 3]

  on(list7, '0', () => t.fail())
  list7.fill(4, NaN, NaN) // [1, 2, 3]

  on(list8, '0', () => t.fail())
  list8.fill(4, 3, 5) // [1, 2, 3]
  t.end()
})

test('emitter#pop', t => {
  const plants = ['broccoli', 'cauliflower', 'cabbage', 'kale', 'tomato']
  const results = [
    ['remove', 'tomato'],
    ['remove', 'kale']
  ]
  const lengthResults = [
    [4],
    [3]
  ]
  t.plan(results.length + lengthResults.length)
  const list = getBox(plants)
  on(list, '4', (...change) => t.same(change, results.shift()))
  on(list, '3', (...change) => t.same(change, results.shift()))
  on(list, 'length', (...change) => t.same(change, lengthResults.shift()))
  list.pop() // 'tomato'
  list.pop() // 'kale'
  t.end()
})

test('emitter#push', t => {
  const animals = ['pigs', 'goats', 'sheep']
  const list = getBox(animals)
  const lengthResults = [
    [4],
    [7]
  ]
  const results = [
    ['insert', undefined, 'cows'],
    ['insert', undefined, 'chickens'],
    ['insert', undefined, 'cats'],
    ['insert', undefined, 'dogs']
  ]
  t.plan(results.length + lengthResults.length)
  on(list, '3', (...change: []) => t.same(change, results.shift()))
  on(list, '4', (...change: []) => t.same(change, results.shift()))
  on(list, '5', (...change: []) => t.same(change, results.shift()))
  on(list, '6', (...change: []) => t.same(change, results.shift()))
  on(list, 'length', (...change) => t.same(change, lengthResults.shift()))

  list.push('cows')
  list.push('chickens', 'cats', 'dogs')
  t.end()
})

test('emitter#reverse odd', t => {
  const arr = ['one', 'two', 'three']
  const list = getBox(arr)
  const results = [
    ['swap', 'one', 'three', false],
    ['swap', 'three', 'one', true]
  ]
  t.plan(results.length)
  on(list, '0', (...change: []) => t.same(change, results.shift()))
  on(list, '1', () => t.fail())
  on(list, '2', (...change: []) => t.same(change, results.shift()))
  list.reverse()
  t.end()
})

test('emitter#reverse even', t => {
  const arr = ['one', 'two', 'three', 'four']
  const list = getBox(arr)
  const results = [
    ['swap', 'one', 'four', false],
    ['swap', 'four', 'one', true],
    ['swap', 'two', 'three', false],
    ['swap', 'three', 'two', true]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(list, '0', handler)
  on(list, '1', handler)
  on(list, '2', handler)
  on(list, '3', handler)
  list.reverse()
  t.end()
})

test('emitter#shift', t => {
  const arr = [1, 2, 3]
  const list = getBox(arr)
  const results = [
    ['remove', 1],
    [2, 0]
  ]
  t.plan(results.length)
  on(list, '0', (...change: []) => t.same(change, results.shift()))
  on(list, 'length', (...change: []) => t.same(change, results.shift()))
  list.shift()
  t.end()
})

test('emitter#sort', t => {
  const arr = [1, 30, 4, 21, 100000]
  const list = getBox(arr)
  const results = [
    ['set', 30, 4],
    ['set', 4, 21],
    ['set', 21, 30]
  ]
  t.plan(results.length)
  // [1, 4, 21, 30, 100000]
  on(list, '0', () => t.fail())
  const handler = (...change: []) => t.same(change, results.shift())
  on(list, '1', handler)
  on(list, '2', handler)
  on(list, '3', handler)
  list.sort((a: number, b: number) => a - b)
  t.end()
})

test('emitter#splice', t => {
  const list = getBox(['Jan', 'March', 'April', 'June'])
  const results = [
    ['insert', undefined, 'Feb'],
    [5, 2],
    ['set', 'April', 'uno'],
    ['insert', undefined, 'dos'],
    [6, 5]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(list, '1', handler)
  on(list, '3', handler)
  on(list, '4', handler)
  on(list, 'length', handler)
  list.splice(1, 0, 'Feb')
  list.splice(3, 1, 'uno', 'dos')
  t.end()
})

test('emitter#splice1', t => {
  // Remove 0 (zero) elements from index 2, and insert 'drum'
  const box = getBox(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['insert', undefined, 'drum'],
    [5, 3]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, 'length', handler)
  box.splice(2, 0, 'drum')
  // ['angel', 'clown', 'drum', ''mandarin', 'sturgeon']
  t.end()
})

test('emitter#splice2', t => {
  // Remove 0 (zero) elements from index 2, and insert 'drum' and 'guitar'
  const box = getBox(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['insert', undefined, 'drum'],
    ['insert', undefined, 'guitar'],
    [6, 3]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, '3', handler)
  on(box, 'length', handler)
  box.splice(2, 0, 'drum', 'guitar')
  // ['angel', 'clown', 'drum', 'guitar', 'mandarin', 'sturgeon']
  t.end()
})

test('emitter#splice3', t => {
  // Remove 1 element from index 3
  const box = getBox(['angel', 'clown', 'drum', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 'mandarin'],
    [4, 3]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '3', handler)
  on(box, 'length', handler)
  box.splice(3, 1)
  // ['angel', 'clown', 'drum', 'sturgeon']
  t.end()
})

test('emitter#splice4', t => {
  // Remove 1 element from index 2, and insert 'trumpet'
  const box = getBox(['angel', 'clown', 'drum', 'sturgeon'])
  const results = [
    ['set', 'drum', 'trumpet']
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, 'length', () => t.fail())
  box.splice(2, 1, 'trumpet')
  // ['angel', 'clown', 'trumpet', 'sturgeon']
  t.end()
})

test('emitter#splice5', t => {
  // Remove 2 elements from index 0, and insert 'parrot', 'anemone' and 'blue'
  const box = getBox(['angel', 'clown', 'trumpet', 'sturgeon'])
  const results = [
    ['set', 'angel', 'parrot'],
    ['set', 'clown', 'anemone'],
    ['insert', undefined, 'blue'],
    [5, 3]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '0', handler)
  on(box, '1', handler)
  on(box, '2', handler)
  on(box, 'length', handler)
  box.splice(0, 2, 'parrot', 'anemone', 'blue')
  // ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon']
  t.end()
})

test('emitter#splice6', t => {
  // Remove 2 elements from index 2
  const box = getBox(['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'])
  const results = [
    ['remove', 'blue'],
    ['remove', 'trumpet'],
    [3, 2]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, '3', handler)
  on(box, 'length', handler)
  box.splice(2, 2)
  // ['parrot', 'anemone', 'sturgeon']
  t.end()
})

test('emitter#splice7', t => {
  // Remove 1 element from index -2
  const box = getBox(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 'mandarin'],
    [3, 2]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, 'length', handler)
  box.splice(-2, 1)
  // ['angel', 'clown', 'sturgeon']
  t.end()
})

test('emitter#splice8', t => {
  // Remove all elements after index 2 (incl.)
  const box = getBox(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 'mandarin'],
    ['remove', 'sturgeon'],
    [2, 2]
  ]
  t.plan(results.length)
  const handler = (...change: []) => t.same(change, results.shift())
  on(box, '2', handler)
  on(box, '3', handler)
  on(box, 'length', handler)
  box.splice(2)
  // ['angel', 'clown']
  t.end()
})

test('emitter#unshift', t => {
  const arr = [1, 2, 3]
  const list = getBox(arr)
  // TODO: this is difficult to track
  // TODO: firstIndexChanged should start from 1 or add arguments in order
  const results = [
    ['insert', undefined, 5],
    ['insert', undefined, 4],
    [5, 2]
  ]
  t.plan(results.length)
  on(list, '0', (...change: []) => t.same(change, results.shift()))
  on(list, 'length', (...change: []) => t.same(change, results.shift()))
  list.unshift(4, 5)
  t.end()
})
