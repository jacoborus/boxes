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
  const list = new List(origin)
  list.forEach(i => { result += i })
  t.is(result, '012', 'basic forEach')
  t.end()
})

test('List#map', t => {
  const origin = [0, 1, 2]
  const list = new List(origin)
  const result = list.map(i => i + 10)
  t.same([10, 11, 12], result, 'basic map')
  t.end()
})

test('List#concat', t => {
  const origin = [0, 1, 2]
  const list = new List(origin)
  const result = list.concat([3, 4], 9)
  t.same([0, 1, 2, 3, 4, 9], result, 'basic concat')
  t.end()
})
