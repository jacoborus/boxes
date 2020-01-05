'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const { Box, List } = Boxes

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
  const origin = [0, 1, 2]
  const list = new List(origin)

  // {}
  t.is(Array.isArray(list), true, 'is array')
  t.is(list.length, 3, 'list has same props as origin')
  t.is(list[0], origin[0], 'list has same props as origin')
  t.is(list[1], origin[1], 'list has same props as origin')
  t.is(list[2], origin[2], 'list has same props as origin')

  // directly changing properties throw error
  t.throws(
    function () {
      list[0] = 1
    },
    'throws error when changing a property of the list'
  )

  // changing origin does not change list
  origin[0] = 9
  t.is(list[0], 0, 'changing origin does not change list')

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

test('List#forEach', t => {
  const origin = [0, 1, 2]
  let result = ''
  let arrTest
  const list = new List(origin)
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

test('List#map', t => {
  const origin = [0, 1, 2]
  const list = new List(origin)
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

test('List#concat', t => {
  const origin = [0, 1, 2]
  const list = new List(origin)
  const result = list.concat([3, 4], 9)
  t.same([0, 1, 2, 3, 4, 9], result, 'basic concat')
  t.end()
})

test('List#every', t => {
  const origin = [0, 1, 2]
  const list = new List(origin)
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
  const list = new List(origin)
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
  const list = new List(origin)
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
  const list = new List(origin)
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