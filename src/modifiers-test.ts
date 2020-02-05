import test from 'tape'
import { Box } from './boxes'

test('Modifiers#copyWithin', t => {
  const original = [1, 2, 3, 4, 5]
  const list1 = Box(original)
  const list2 = Box(original)
  const list3 = Box(original)
  const list4 = Box(original)
  list1.copyWithin(-2)
  list2.copyWithin(0, 3)
  list3.copyWithin(0, 3, 4)
  list4.copyWithin(-2, -3, -1)
  t.same(list1, [1, 2, 3, 1, 2])
  t.same(list2, [4, 5, 3, 4, 5])
  t.same(list3, [4, 2, 3, 4, 5])
  t.same(list4, [1, 2, 3, 3, 4])
  t.end()
})

test('Modifiers#fill', t => {
  const arr = [1, 2, 3]
  const list1 = Box(arr)
  const list2 = Box(arr)
  const list3 = Box(arr)
  const list4 = Box(arr)
  const list5 = Box(arr)
  const list6 = Box(arr)
  const list7 = Box(arr)
  const list8 = Box(arr)
  list1.fill(4) // [4, 4, 4]
  list2.fill(4, 1) // [1, 4, 4]
  list3.fill(4, 1, 2) // [1, 4, 3]
  list4.fill(4, 1, 1) // [1, 2, 3]
  list5.fill(4, 3, 3) // [1, 2, 3]
  list6.fill(4, -3, -2) // [4, 2, 3]
  list7.fill(4, NaN, NaN) // [1, 2, 3]
  list8.fill(4, 3, 5) // [1, 2, 3]
  t.same(list1, [4, 4, 4], 'array#fill')
  t.same(list2, [1, 4, 4])
  t.same(list3, [1, 4, 3])
  t.same(list4, [1, 2, 3])
  t.same(list5, [1, 2, 3])
  t.same(list6, [4, 2, 3])
  t.same(list7, [1, 2, 3])
  t.same(list8, [1, 2, 3])
  t.end()
})

test('modifiers#pop', t => {
  const plants = ['broccoli', 'cauliflower', 'cabbage', 'kale', 'tomato']
  const list = Box(plants)
  const res1 = list.pop() // "tomato"
  t.is(res1, 'tomato')
  t.same(list, ['broccoli', 'cauliflower', 'cabbage', 'kale'])
  list.pop()
  t.same(list, ['broccoli', 'cauliflower', 'cabbage'])
  t.end()
})

test('modifiers#push', t => {
  const animals = ['pigs', 'goats', 'sheep']
  const list = Box(animals)
  const count = list.push('cows')
  t.is(count, 4)
  t.same(list, ['pigs', 'goats', 'sheep', 'cows'])
  list.push('chickens', 'cats', 'dogs')
  t.same(list, ['pigs', 'goats', 'sheep', 'cows', 'chickens', 'cats', 'dogs'])
  t.end()
})

test('modifiers#reverse', t => {
  const arr = ['one', 'two', 'three']
  const list = Box(arr)
  const reversed = list.reverse()
  t.same(reversed, ['three', 'two', 'one'])
  t.is(list, reversed)
  t.end()
})

test('modifiers#shift', t => {
  const arr = [1, 2, 3]
  const list = Box(arr)
  const firstElement = list.shift()
  t.same(list, [2, 3])
  t.is(firstElement, 1)
  t.end()
})

test('modifiers#sort', t => {
  const months = ['March', 'Jan', 'Feb', 'Dec']
  const list = Box(months)
  list.sort()
  t.same(list, ['Dec', 'Feb', 'Jan', 'March'])

  const arr = [1, 30, 4, 21, 100000]

  const list1 = Box(arr)
  list1.sort()
  t.same(list1, [1, 100000, 21, 30, 4])

  const list2 = Box(arr)
  list2.sort((a: number, b: number) => a - b)
  t.same(list2, [1, 4, 21, 30, 100000])
  t.end()
})

test('modifiers#splice', t => {
  const months = ['Jan', 'March', 'April', 'June']
  const list = Box(months)
  list.splice(1, 0, 'Feb')
  t.same(list, ['Jan', 'Feb', 'March', 'April', 'June'])
  list.splice(3, 1, 'uno', 'dos')
  t.same(list, ['Jan', 'Feb', 'March', 'uno', 'dos', 'June'])
  t.end()
})

test('modifiers#unshift', t => {
  const arr = [1, 2, 3]
  const list = Box(arr)
  const result = list.unshift(4, 5)
  t.is(result, 5)
  t.same(list, [4, 5, 1, 2, 3])
  t.end()
})
