import test from 'tape'
import { getBox } from './boxes'

test('getBox', t => {
  const origin = { a: 1 }
  const box = getBox(origin)

  // {}
  t.is(typeof box, 'object')
  t.is(Object.keys(origin).length, 1, 'getBox has same props as origin')
  t.is(box.a, origin.a, 'getBox has same props as origin')

  // changing origin does not change box
  origin.a = 9
  t.is(box.a, 1, 'changing origin does not change box')

  // box props can be changed
  box.a = 9
  t.is(box.a, 9, 'box props can be changed')

  // setting a object as value will add a box created from that object
  const obj = {}
  box.obj = obj
  t.isNot(obj, box.obj, 'Object props added as boxes')
  // allow to delete properties
  t.doesNotThrow(
    function () {
      delete box.uno
    },
    'does not allow to delete properties'
  )
  t.notOk('uno' in box, 'allow remove properties')
  box.obj.dos = 2
  t.is(box.obj.dos, 2, 'boxes inside boxes uses set to assign props')

  t.end()
})

test('List', t => {
  const origin = [2, 3, 4]
  const list = getBox(origin)

  t.is(Array.isArray(list), true, 'is array')
  t.is(list.length, 3, 'list has same props as origin')
  t.same(origin, list, 'list has same props as origin')

  t.doesNotThrow(
    function () {
      list[0] = 1
    },
    'allow changing properties'
  )

  t.doesNotThrow(
    function () {
      delete list[1]
    },
    'allow to delete properties'
  )

  origin[0] = 9
  t.is(list[0], 1, 'changing origin does not change list')

  list[0] = 9
  t.is(list[0], 9, 'list props can be changed')

  // setting a array as value will add a list created from that array
  const arr = ['uno']
  list[1] = arr
  t.isNot(arr, list[1], 'Array props added as list')

  // directly changing properties throw error
  t.doesNotThrow(
    function () {
      list[2] = '2'
    },
    'Array props added as lists'
  )
  list[1][0] = '2'
  t.is(list[1][0], '2', 'boxes inside boxes')

  t.end()
})
