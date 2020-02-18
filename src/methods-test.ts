import test from 'tape'
import { getBox } from './boxes'

test('List#every', t => {
  const origin = [0, 1, 2]
  const list = getBox(origin)
  const positiveResult = list.every((value: any, _: number, arr: []) => {
    t.isNot(arr, origin, 'does not expose real array')
    return value < 10
  })
  t.ok(positiveResult, 'positive result')
  const negativeResult = list.every((value: number) => value < 2)
  t.notOk(negativeResult, 'negative result')
  t.end()
})

test('List#filter', t => {
  const origin = [0, 1, 2]
  const list = getBox(origin)
  const result = list.filter((value: any, _: number, arr: []) => {
    t.isNot(arr, origin, 'does not expose real array')
    return value < 2
  })
  t.same([0, 1], result, 'basic filter')
  t.end()
})

test('List#find', t => {
  const origin = [0, 1, 2]
  const list = getBox(origin)
  const result = list.find((value: any, _: any, arr: []) => {
    t.isNot(arr, origin, 'does not expose real array')
    return value > 0
  })
  t.is(1, result, 'basic find')
  t.end()
})

test('List#findIndex', t => {
  const origin = [0, 1, 2]
  const list = getBox(origin)
  const result = list.findIndex((value: any, _: number, arr: []) => {
    t.isNot(arr, origin, 'does not expose real array')
    return value > 0
  })
  t.is(1, result, 'basic findIndex')
  t.end()
})

test('List#flatMap', t => {
  const arr = [1, 2, 3, 4]
  const list = getBox(arr)
  t.same(list.map((x: number) => [x * 2]), [[2], [4], [6], [8]])
  t.same(list.flatMap((x: number) => [x * 2]), [2, 4, 6, 8])
  // only one level is flattened
  t.same(list.flatMap((x: number) => [[x * 2]]), [[2], [4], [6], [8]])
  t.end()
})

test('List#forEach', t => {
  const origin = [0, 1, 2]
  let result = ''
  const list = getBox(origin)
  list.forEach((value: any, _: number, __: []) => {
    result += value
  })
  t.is(result, '012', 'basic forEach')
  t.end()
})

test('List#map', t => {
  const origin = [0, 1, 2]
  const list = getBox(origin)
  const result = list.map((value: any, _: number, __: []) => {
    return value + 10
  })
  t.same([10, 11, 12], result, 'basic map')
  t.end()
})

test('List#reduce', t => {
  const array1 = [1, 2, 3, 4]
  const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue
  const list = getBox(array1)
  t.is(list.reduce(reducer), 10)
  t.is(list.reduce(reducer, 5), 15)
  t.end()
})

test('List#reduceRight', t => {
  const array1 = [[0, 1], [2, 3], [4, 5]]
  const list = getBox(array1)
  const result = list.reduceRight((acc: [], cur: []) => acc.concat(cur))
  t.same(result, [4, 5, 2, 3, 0, 1])
  t.end()
})

test('List#some', t => {
  function isBiggerThan10 (element: number, _: number, __: []): boolean {
    return element > 10
  }
  const origin1 = [2, 5, 8, 1, 4]
  const origin2 = [12, 5, 8, 1, 4]
  const list1 = getBox(origin1)
  const list2 = getBox(origin2)
  t.notOk(list1.some(isBiggerThan10))
  t.ok(list2.some(isBiggerThan10))
  t.end()
})
