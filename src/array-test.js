'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const { Box } = Boxes

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
