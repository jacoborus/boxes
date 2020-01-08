'use strict'

const test = require('tape')
const Boxes = require('./boxes.js')
const { Box } = Boxes

test('Box', t => {
  t.throws(
    function () {
      return new Box(null)
    },
    'throws when argument is null'
  )
  t.throws(
    function () {
      return new Box()
    },
    'throws when no argument is passed'
  )
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
  // does not allow to delete properties
  t.throws(
    function () {
      delete box.uno
    },
    'does not allow to delete properties'
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

  // does not allow to delete properties
  t.throws(
    function () {
      delete list[1]
    },
    'does not allow to delete properties'
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
