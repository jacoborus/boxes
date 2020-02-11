import test from 'tape'
import { Box, on, clear } from './boxes'

test('emitter#set in object', t => {
  t.plan(4)
  const box = Box({
    a: 1,
    b: {
      x: 'x',
      z: 'z'
    },
    c: [1, 2, 3, 4]
  })
  // ee.emit(proxy, ['set', prop, oldValue, newValue])
  on(box, ([kind, prop, oldValue, newValue]) => {
    t.is(kind, 'set', 'default call on all properties')
    t.is(prop, 'a', 'default call on all properties')
    t.is(oldValue, 1, 'default call on all properties')
    t.is(newValue, 99, 'default call on all properties')
  })
  box.a = 99
  clear(box)
  box.a = true
  t.end()
})

test('emitter#delete in object', t => {
  const box = Box({ a: 1, b: 2 })
  const results = [
    ['delete', 'a', 1]
  ]
  t.plan(results.length)
  on(box, change => t.same(change, results.shift()))
  delete box.a
  clear(box)
  delete box.b
  t.end()
})

test('emitter#set in array', t => {
  const box = Box([1, 2, 3, 4])
  const results = [
    ['set', '2', 3, 99]
  ]
  t.plan(results.length)
  on(box, change => t.same(change, results.shift()))
  box['2'] = 99
  clear(box)
  box['2'] = true
  t.end()
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
  t.end()
})

test('emitter#delete in array', t => {
  const box = Box([1, 2, 3, 4])
  const results = [
    ['delete', '2', 3]
  ]
  t.plan(results.length)
  on(box, change => t.same(change, results.shift()))
  delete box['2']
  clear(box)
  delete box[0]
  t.end()
})

test('emitter#copyWithin', t => {
  const original = [1, 2, 3, 4, 5]
  const list1 = Box(original)
  const list2 = Box(original)
  const list3 = Box(original)
  const list4 = Box(original)
  t.plan(7)
  const results1 = [
    ['set', '3', 4, 1],
    ['set', '4', 5, 2]
  ]
  on(list1, change => t.same(change, results1.shift(), '::1'))
  // [1, 2, 3, 1, 2]
  list1.copyWithin(-2)

  const results2 = [
    ['set', '0', 1, 4],
    ['set', '1', 2, 5]
  ]
  // [4, 5, 3, 4, 5]
  on(list2, change => t.same(change, results2.shift(), '::2'))
  list2.copyWithin(0, 3)

  const results3 = [
    ['set', '0', 1, 4]
  ]
  on(list3, change => t.same(change, results3.shift(), '::3'))
  // [4, 2, 3, 4, 5]
  list3.copyWithin(0, 3, 4)

  const results4 = [
    ['set', '3', 4, 3],
    ['set', '4', 5, 4]
  ]
  on(list4, change => t.same(change, results4.shift(), '::4'))
  // [1, 2, 3, 3, 4]
  list4.copyWithin(-2, -3, -1)
  t.end()
})

test('emitter#fill', t => {
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
    ['set', '0', 1, 4],
    ['set', '1', 2, 4],
    ['set', '2', 3, 4]
  ]
  on(list1, change => t.same(res1.shift(), change, '1'))
  list1.fill(4) // [4, 4, 4]

  const res2 = [
    ['set', '1', 2, 4],
    ['set', '2', 3, 4]
  ]
  on(list2, change => t.same(res2.shift(), change, '2'))
  list2.fill(4, 1) // [1, 4, 4]

  const res3 = [
    ['set', '1', 2, 4]
  ]
  on(list3, change => t.same(res3.shift(), change, '3'))
  list3.fill(4, 1, 2) // [1, 4, 3]

  on(list4, () => t.fail())
  list4.fill(4, 1, 1) // [1, 2, 3]

  on(list5, () => t.fail())
  list5.fill(4, 3, 3) // [1, 2, 3]

  const res6 = [
    ['set', '0', 1, 4]
  ]
  on(list6, change => t.same(res6.shift(), change, '6'))
  list6.fill(4, -3, -2) // [4, 2, 3]

  on(list7, () => t.fail())
  list7.fill(4, NaN, NaN) // [1, 2, 3]

  on(list8, () => t.fail())
  list8.fill(4, 3, 5) // [1, 2, 3]
  t.end()
})

test('emitter#pop', t => {
  const plants = ['broccoli', 'cauliflower', 'cabbage', 'kale', 'tomato']
  const results = [
    ['remove', 4, 'tomato'],
    ['length', 4],
    ['remove', 3, 'kale'],
    ['length', 3]
  ]
  t.plan(results.length)
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
    ['insert', '3', 'cows'],
    ['length', 4],
    ['insert', '4', 'chickens'],
    ['insert', '5', 'cats'],
    ['insert', '6', 'dogs'],
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
    ['length', 2, 0]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.shift()
  t.end()
})

test('emitter#sort', t => {
  const arr = [1, 30, 4, 21, 100000]
  const list = Box(arr)
  const results = [
    ['set', '1', 30, 4],
    ['set', '2', 4, 21],
    ['set', '3', 21, 30]
  ]
  t.plan(results.length)
  // [1, 4, 21, 30, 100000]
  on(list, change => t.same(change, results.shift()))
  list.sort((a: number, b: number) => a - b)
  t.end()
})

test('emitter#splice', t => {
  const list = Box(['Jan', 'March', 'April', 'June'])
  const results = [
    ['insert', 1, 'Feb'],
    ['length', 5, 2],
    ['set', 3, 'April', 'uno'],
    ['insert', 4, 'dos'],
    ['length', 6, 5]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.splice(1, 0, 'Feb')
  list.splice(3, 1, 'uno', 'dos')
  t.end()
})

test('emitter#splice1', t => {
  // Remove 0 (zero) elements from index 2, and insert 'drum'
  const box = Box(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['insert', 2, 'drum'],
    ['length', 5, 3]
  ]
  t.plan(results.length)
  on(box, change => t.same(change, results.shift()))
  box.splice(2, 0, 'drum')
  // ['angel', 'clown', 'drum', ''mandarin', 'sturgeon']
  t.end()
})

test('emitter#splice2', t => {
  // Remove 0 (zero) elements from index 2, and insert 'drum' and 'guitar'
  const box = Box(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['insert', 2, 'drum'],
    ['insert', 3, 'guitar'],
    ['length', 6, 3]
  ]
  t.plan(results.length)
  on(box, change => t.same(change, results.shift()))
  box.splice(2, 0, 'drum', 'guitar')
  // ['angel', 'clown', 'drum', 'guitar', 'mandarin', 'sturgeon']
  t.end()
})

test('emitter#splice3', t => {
  // Remove 1 element from index 3
  const box3 = Box(['angel', 'clown', 'drum', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 3, 'mandarin'],
    ['length', 4, 3]
  ]
  t.plan(results.length)
  on(box3, change => t.same(change, results.shift()))
  box3.splice(3, 1)
  // ['angel', 'clown', 'drum', 'sturgeon']
  t.end()
})

test('emitter#splice4', t => {
  // Remove 1 element from index 2, and insert 'trumpet'
  const box4 = Box(['angel', 'clown', 'drum', 'sturgeon'])
  const results = [
    ['set', 2, 'drum', 'trumpet']
  ]
  t.plan(results.length)
  on(box4, change => t.same(change, results.shift()))
  box4.splice(2, 1, 'trumpet')
  // ['angel', 'clown', 'trumpet', 'sturgeon']
  t.end()
})

test('emitter#splice5', t => {
  // Remove 2 elements from index 0, and insert 'parrot', 'anemone' and 'blue'
  const box5 = Box(['angel', 'clown', 'trumpet', 'sturgeon'])
  const results = [
    ['set', 0, 'angel', 'parrot'],
    ['set', 1, 'clown', 'anemone'],
    ['insert', 2, 'blue'],
    ['length', 5, 3]
  ]
  t.plan(results.length)
  on(box5, change => t.same(change, results.shift()))
  box5.splice(0, 2, 'parrot', 'anemone', 'blue')
  // ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon']
  t.end()
})

test('emitter#splice6', t => {
  // Remove 2 elements from index 2
  const box6 = Box(['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'])
  const results = [
    ['remove', 2, 'blue'],
    ['remove', 3, 'trumpet'],
    ['length', 3, 2]
  ]
  t.plan(results.length)
  on(box6, change => t.same(change, results.shift()))
  box6.splice(2, 2)
  // ['parrot', 'anemone', 'sturgeon']
  t.end()
})

test('emitter#splice7', t => {
  // Remove 1 element from index -2
  const box7 = Box(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 2, 'mandarin'],
    ['length', 3, 2]
  ]
  t.plan(results.length)
  on(box7, change => t.same(change, results.shift()))
  box7.splice(-2, 1)
  // ['angel', 'clown', 'sturgeon']
  t.end()
})

test('emitter#splice8', t => {
  // Remove all elements after index 2 (incl.)
  const box8 = Box(['angel', 'clown', 'mandarin', 'sturgeon'])
  const results = [
    ['remove', 2, 'mandarin'],
    ['remove', 3, 'sturgeon'],
    ['length', 2, 2]
  ]
  t.plan(results.length)
  on(box8, change => t.same(change, results.shift()))
  box8.splice(2)
  // ['angel', 'clown']
  t.end()
})

test('emitter#unshift', t => {
  const arr = [1, 2, 3]
  const list = Box(arr)
  const results = [
    ['insert', 0, 5],
    ['insert', 0, 4],
    ['length', 5, 2]
  ]
  t.plan(results.length)
  on(list, change => t.same(change, results.shift()))
  list.unshift(4, 5)
  t.end()
})
