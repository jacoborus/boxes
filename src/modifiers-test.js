'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const {
  Box, copyWithin, fill, pop, push, reverse, shift, sort, splice, unshift
} = Boxes

test('Modifiers#copyWithin', t => {
  const original = [1, 2, 3, 4, 5]
  const list1 = new Box(original)
  const list2 = new Box(original)
  const list3 = new Box(original)
  const list4 = new Box(original)
  const result1 = copyWithin(list1, -2)
  const result2 = copyWithin(list2, 0, 3)
  const result3 = copyWithin(list3, 0, 3, 4)
  const result4 = copyWithin(list4, -2, -3, -1)
  t.is(list1, result1)
  t.is(list2, result2)
  t.is(list3, result3)
  t.is(list4, result4)
  t.same(result1, [1, 2, 3, 1, 2])
  t.same(result2, [4, 5, 3, 4, 5])
  t.same(result3, [4, 2, 3, 4, 5])
  t.same(result4, [1, 2, 3, 3, 4])
  t.end()
})

test('Modifiers#fill', t => {
  const arr = [1, 2, 3]
  const list1 = new Box(arr)
  const list2 = new Box(arr)
  const list3 = new Box(arr)
  const list4 = new Box(arr)
  const list5 = new Box(arr)
  const list6 = new Box(arr)
  const list7 = new Box(arr)
  const list8 = new Box(arr)
  const result1 = fill(list1, 4) // [4, 4, 4]
  const result2 = fill(list2, 4, 1) // [1, 4, 4]
  const result3 = fill(list3, 4, 1, 2) // [1, 4, 3]
  const result4 = fill(list4, 4, 1, 1) // [1, 2, 3]
  const result5 = fill(list5, 4, 3, 3) // [1, 2, 3]
  const result6 = fill(list6, 4, -3, -2) // [4, 2, 3]
  const result7 = fill(list7, 4, NaN, NaN) // [1, 2, 3]
  const result8 = fill(list8, 4, 3, 5) // [1, 2, 3]
  t.same(list1, result1, 'result and list are same object')
  t.same(list2, result2)
  t.same(list3, result3)
  t.same(list4, result4)
  t.same(list5, result5)
  t.same(list6, result6)
  t.same(list7, result7)
  t.same(list8, result8)
  t.same(result1, [4, 4, 4], 'box is correctly modified')
  t.same(result2, [1, 4, 4])
  t.same(result3, [1, 4, 3])
  t.same(result4, [1, 2, 3])
  t.same(result5, [1, 2, 3])
  t.same(result6, [4, 2, 3])
  t.same(result7, [1, 2, 3])
  t.same(result8, [1, 2, 3])
  t.end()
})

test('modifiers#pop', t => {
  const plants = ['broccoli', 'cauliflower', 'cabbage', 'kale', 'tomato']
  const list = new Box(plants)
  const res1 = pop(list) // "tomato"
  t.is(res1, 'tomato')
  t.same(list, ['broccoli', 'cauliflower', 'cabbage', 'kale'])
  pop(list)
  t.same(list, ['broccoli', 'cauliflower', 'cabbage'])
  t.end()
})

test('modifiers#push', t => {
  const animals = ['pigs', 'goats', 'sheep']
  const list = new Box(animals)
  const count = push(list, 'cows')
  t.is(count, 4)
  t.same(list, ['pigs', 'goats', 'sheep', 'cows'])
  push(list, 'chickens', 'cats', 'dogs')
  t.same(list, ['pigs', 'goats', 'sheep', 'cows', 'chickens', 'cats', 'dogs'])
  t.end()
})

test('modifiers#reverse', t => {
  const arr = ['one', 'two', 'three']
  const list = new Box(arr)
  const reversed = reverse(list)
  t.same(reversed, ['three', 'two', 'one'])
  t.is(list, reversed)
  t.end()
})

test('modifiers#shift', t => {
  const arr = [1, 2, 3]
  const list = new Box(arr)
  const firstElement = shift(list)
  t.same(list, [2, 3])
  t.is(firstElement, 1)
  t.end()
})

test('modifiers#sort', t => {
  const months = ['March', 'Jan', 'Feb', 'Dec']
  const list = new Box(months)
  sort(list)
  t.same(list, ['Dec', 'Feb', 'Jan', 'March'])

  const arr = [1, 30, 4, 21, 100000]

  const list1 = new Box(arr)
  sort(list1)
  t.same(list1, [1, 100000, 21, 30, 4])

  const list2 = new Box(arr)
  sort(list2, (a, b) => a - b)
  t.same(list2, [1, 4, 21, 30, 100000])
  t.end()
})

test('modifiers#splice', t => {
  const months = ['Jan', 'March', 'April', 'June']
  const list = new Box(months)
  const result = splice(list, 1, 0, 'Feb')
  t.is(result, list)
  t.same(list, ['Jan', 'Feb', 'March', 'April', 'June'])

  splice(list, 3, 1, 'uno', 'dos')
  t.same(list, ['Jan', 'Feb', 'March', 'uno', 'dos', 'June'])
  t.end()
})

test('modifiers#unshift', t => {
  const arr = [1, 2, 3]
  const list = new Box(arr)
  const result = unshift(list, 4, 5)
  t.is(result, 5)
  t.same(list, [4, 5, 1, 2, 3])
  t.end()
})
