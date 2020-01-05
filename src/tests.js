'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const { Box, copyWithin, fill, pop, push, reverse, shift } = Boxes

test('Box', t => {
  const origin = { a: 1 }
  const box = new Box(origin)

  // {}
  t.is(typeof box, 'object')
  t.is(Object.keys(origin).length, 1, 'Box has same props as origin')
  t.is(box.a, origin.a, 'Box has same props as origin')

  // directly changing properties throw error
  t.throws(
    function () {
      box.uno = 1
    },
    'throws error when changing a property of the box'
  )

  // changing origin does not change box
  origin.a = 9
  t.is(box.a, 1, 'changing origin does not change box')

  // box props can be changed with Boxes.set
  Boxes.set(box, 'a', 9)
  t.is(box.a, 9, 'box props can be changed with Boxes.set')

  // setting a object as value will add a box created from that object
  const obj = {}
  Boxes.set(box, 'obj', obj)
  t.isNot(obj, box.obj, 'Object props added as boxes')
  // directly changing properties throw error
  t.throws(
    function () {
      box.uno = 1
    },
    'Object props added as boxes'
  )
  Boxes.set(box.obj, 'dos', 2)
  t.is(box.obj.dos, 2, 'boxes inside boxes uses set to assign props')

  t.end()
})

test('List', t => {
  const origin = [2, 3, 4]
  const list = new Box(origin)

  // {}
  t.is(Array.isArray(list), true, 'is array')
  t.is(list.length, 3, 'list has same props as origin')
  t.same(origin, list, 'list has same props as origin')

  // directly changing properties throw error
  t.throws(
    function () {
      list[0] = 1
    },
    'throws error when changing a property of the list'
  )

  // changing origin does not change list
  origin[0] = 9
  t.is(list[0], 2, 'changing origin does not change list')

  // list props can be changed with Boxes.set
  Boxes.set(list, 0, 9)
  t.is(list[0], 9, 'list props can be changed with Boxes.set')

  // setting a array as value will add a list created from that array
  const arr = ['uno']
  Boxes.set(list, 1, arr)
  t.isNot(arr, list[1], 'Array props added as list')
  // directly changing properties throw error
  t.throws(
    function () {
      list[2] = '2'
    },
    'Array props added as lists'
  )
  Boxes.set(list[1], 0, '2')
  t.is(list[1][0], '2', 'boxes inside boxes uses set to assign props')

  t.end()
})

test('List (deep)', t => {
  const ori = [2, 3, [4, 5]]
  const list = new Box(ori)
  t.same(ori, list, 'list has same props as origin')
  t.end()
})

test('List#concat', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  const result = list.concat([3, 4], 9)
  t.same([0, 1, 2, 3, 4, 9], result, 'basic concat')
  t.end()
})

test('List#every', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  let arrTest
  const positiveResult = list.every((value, i, arr) => {
    arrTest = arr
    return value < 10
  })
  t.ok(positiveResult, 'positive result')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  const negativeResult = list.every(value => value < 2)
  t.notOk(negativeResult, 'negative result')
  t.end()
})

test('List#filter', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  let arrTest
  const result = list.filter((value, i, arr) => {
    arrTest = arr
    return value < 2
  })
  t.same([0, 1], result, 'basic filter')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  t.end()
})

test('List#find', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  let arrTest
  const result = list.find((value, i, arr) => {
    arrTest = arr
    return value > 0
  })
  t.is(1, result, 'basic find')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  t.end()
})

test('List#findIndex', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  let arrTest
  const result = list.findIndex((value, i, arr) => {
    arrTest = arr
    return value > 0
  })
  t.is(1, result, 'basic findIndex')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  t.end()
})

test('List#flat', t => {
  const origin = [1, 2, [3, 4]]
  const list = new Box(origin)
  const result = list.flat()
  t.same(result, [1, 2, 3, 4], 'basic flat')

  const arr2 = [1, 2, [3, 4, [5, 6]]]
  const list2 = new Box(arr2)
  const flat2 = list2.flat()
  t.is(flat2[4][0], 5, 'flat default omit depth')

  const arr3 = [1, 2, [3, 4, [5, 6]]]
  const list3 = new Box(arr3)
  const flat3 = list3.flat(2)
  t.is(flat3[5], 6, 'flat default omit depth')

  t.end()
})

test('List#flatMap', t => {
  const arr = [1, 2, 3, 4]
  const list = new Box(arr)
  t.same(list.map(x => [x * 2]), [[2], [4], [6], [8]])
  t.same(list.flatMap(x => [x * 2]), [2, 4, 6, 8])
  // only one level is flattened
  t.same(list.flatMap(x => [[x * 2]]), [[2], [4], [6], [8]])
  t.end()
})

test('List#forEach', t => {
  const origin = [0, 1, 2]
  let result = ''
  let arrTest
  const list = new Box(origin)
  list.forEach((value, i, arr) => {
    arrTest = arr
    result += value
  })
  t.is(result, '012', 'basic forEach')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  t.end()
})

test('List#includes', t => {
  const nums = [1, 2, 3]
  const list = new Box(nums)
  t.ok(list.includes(2), true)
  t.notOk(list.includes(4), false)
  t.notOk(list.includes(3, 3), false)
  t.ok(list.includes(3, -1), true)
  const nans = [1, 2, NaN]
  const listnan = new Box(nans)
  t.ok(listnan.includes(NaN), true)
  t.end()
})

test('List#indexOf', t => {
  const beasts = ['ant', 'bison', 'camel', 'duck', 'bison']
  const list = new Box(beasts)
  t.is(list.indexOf('bison'), 1, 'basic indexOf')
  t.is(list.indexOf('bison', 2), 4, 'start from index 2')
  t.is(list.indexOf('giraffe'), -1, 'not found')
  t.end()
})

test('List#join', t => {
  const elements = ['Fire', 'Air', 'Water']
  const list = new Box(elements)

  t.is(list.join(), 'Fire,Air,Water')
  t.is(list.join(''), 'FireAirWater')
  t.is(list.join('-'), 'Fire-Air-Water')
  t.end()
})

test('List#lastIndexOf', t => {
  var numbers = [2, 5, 9, 2]
  const list = new Box(numbers)
  t.is(list.lastIndexOf(2), 3)
  t.is(list.lastIndexOf(7), -1)
  t.is(list.lastIndexOf(2, 3), 3)
  t.is(list.lastIndexOf(2, 2), 0)
  t.is(list.lastIndexOf(2, -2), 0)
  t.is(list.lastIndexOf(2, -1), 3)
  t.end()
})

test('List#map', t => {
  const origin = [0, 1, 2]
  const list = new Box(origin)
  let arrTest
  const result = list.map((value, i, arr) => {
    arrTest = arr
    return value + 10
  })
  t.same([10, 11, 12], result, 'basic map')
  t.throws(
    function () {
      arrTest[0] = 999
    },
    'does not expose real array'
  )
  t.end()
})

test('List#reduce', t => {
  const array1 = [1, 2, 3, 4]
  const reducer = (accumulator, currentValue) => accumulator + currentValue
  const list = new Box(array1)
  t.is(list.reduce(reducer), 10)
  t.is(list.reduce(reducer, 5), 15)
  t.end()
})

test('List#reduceRight', t => {
  const array1 = [[0, 1], [2, 3], [4, 5]]
  const list = new Box(array1)
  const result = list.reduceRight((acc, cur) => acc.concat(cur))
  t.same(result, [4, 5, 2, 3, 0, 1])
  t.end()
})

test('List#slice', t => {
  const animals = ['ant', 'bison', 'camel', 'duck', 'elephant']
  const list = new Box(animals)
  t.same(list.slice(2), ['camel', 'duck', 'elephant'])
  t.same(list.slice(2, 4), ['camel', 'duck'])
  t.same(list.slice(1, 5), ['bison', 'camel', 'duck', 'elephant'])
  t.end()
})

test('List#some', t => {
  function isBiggerThan10 (element, index, array) {
    return element > 10
  }

  const origin1 = [2, 5, 8, 1, 4]
  const origin2 = [12, 5, 8, 1, 4]
  const list1 = new Box(origin1)
  const list2 = new Box(origin2)
  t.notOk(list1.some(isBiggerThan10))
  t.ok(list2.some(isBiggerThan10))
  t.end()
})

test('List#toLocaleString', t => {
  const prices = ['￥7', 500, 8123, 12]
  const list = new Box(prices)
  t.is(
    list.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }),
    prices.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })
  )
  t.end()
})

test('List#toString', t => {
  const array = [1, 2, 'a', '1a']
  const list = new Box(array)

  t.is(list.toString(), '1,2,a,1a')
  t.end()
})

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
