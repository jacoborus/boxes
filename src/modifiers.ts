import ee from './ee'
import { ArrayBox } from './tools'

type Modifiers = { [index: string]: any }

const modifiers: Modifiers = {
  fill (target: ArrayBox, proxy: ArrayBox, getBox: any) {
    return function (value: any, start = 0, end = target.length) {
      value = getBox(value)
      if (!target.__isWatched) {
        target.fill(value, start, end)
        return proxy
      }
      const len = target.length
      if (start < 0) start += len
      if (end < 0) end += len
      else if (end > len) end = len
      if (end <= start) return proxy
      const changes = []
      while (start < end) {
        const oldValue = target[start]
        target[start] = value
        const startStr = '' + start
        if (oldValue !== value) changes.push([startStr, oldValue, value])
        ++start
      }
      changes.forEach(([startStr, oldValue, value]) => {
        ee.emit(proxy, startStr, proxy, startStr, 'set', oldValue, value)
      })
      return proxy
    }
  },

  pop: (target: ArrayBox, proxy: ArrayBox) => () => {
    if (!target.__isWatched) return target.pop()
    const result = target.pop()
    const len = target.length
    const lenStr = '' + len
    ee.emit(proxy, lenStr, proxy, lenStr, 'remove', result, undefined)
    ee.emit(proxy, 'length', proxy, undefined, 'length', len + 1, len)
    return result
  },

  push: (target: ArrayBox, proxy: ArrayBox, getBox: any) => function (...args: []) {
    if (!target.__isWatched) {
      const items = args.map(val => getBox(val))
      target.push(...items)
      return target.length
    }
    args.forEach((value: any) => {
      const len = target.length
      const newValue = getBox(value)
      target[len] = newValue
      const lenStr = '' + len
      ee.emit(proxy, lenStr, proxy, lenStr, 'insert', undefined, newValue)
    })
    const len = target.length
    ee.emit(proxy, 'length', proxy, undefined, 'length', len - args.length, len)
    return target.length
  },

  reverse: (target: ArrayBox, proxy: ArrayBox) => () => {
    if (!target.__isWatched) {
      target.reverse()
      return proxy
    }
    const len = target.length
    target.reverse()
    const half = Math.floor(len / 2)
    let count = 0
    while (count < half) {
      const distCount = len - count - 1
      const oldValue = target[distCount]
      const newValue = target[count]
      const countStr = '' + count
      const distCountStr = '' + distCount
      ee.emit(proxy, countStr, proxy, countStr, 'swap', oldValue, newValue)
      ee.emit(proxy, distCountStr, proxy, distCountStr, 'swap', newValue, oldValue)
      ++count
    }
    return proxy
  },

  shift: (target: ArrayBox, proxy: ArrayBox) => () => {
    if (!target.__isWatched) return target.shift()
    const shifted = target.shift()
    ee.emit(proxy, '0', proxy, '0', 'remove', shifted, undefined)
    const len = target.length
    ee.emit(proxy, 'length', proxy, '0', 'length', len + 1, len)
    return shifted
  },

  sort (target: ArrayBox, proxy: ArrayBox) {
    return function (fn: (a: any, b: any) => number) {
      if (!target.__isWatched) {
        target.sort(fn)
        return proxy
      }
      const copy = target.slice()
      target.sort(fn)
      target.forEach((item, i) => {
        const oldValue = copy[i]
        if (item !== oldValue) {
          const istr = '' + i
          ee.emit(proxy, istr, proxy, istr, 'swap', oldValue, item)
        }
      })
      return proxy
    }
  },

  splice: (target: ArrayBox, proxy: ArrayBox, getBox: any) => {
    return function (start: number, deleteCount?: number, ...entries: []) {
      if (!target.__isWatched) {
        const items = entries ? getBox(entries) : []
        if (!('0' in arguments)) return []
        return '1' in arguments
          ? target.splice(start, deleteCount as number, ...items)
          : target.splice(start)
      }
      const initLen = target.length
      const items = getBox(entries || [])
      start = start > initLen
        ? initLen
        : start > -1
          ? start
          : initLen > -start
            ? initLen + start
            : 0
      const nopos = !('1' in arguments) || deleteCount as number + start > initLen
      const dCount = nopos
        ? initLen - start
        : deleteCount as number

      if (dCount + start > initLen) deleteCount = initLen - start
      const result = getBox(target.splice(start, dCount, ...items) || [])
      const resultLen = result.length
      const itemsLen = items.length
      const max = Math.max(resultLen, itemsLen, dCount)
      let count = 0
      while (count < max) {
        const pos = '' + (start + count)
        const oldValue = result[count]
        const newValue = items[count]
        const kind = resultLen > count && itemsLen > count
          ? 'set'
          : itemsLen > count
            ? 'insert'
            : 'remove'
        ee.emit(proxy, pos, proxy, pos, kind, oldValue, newValue)
        ++count
      }
      if (itemsLen !== resultLen) {
        const pos = nopos ? undefined : '' + (start + itemsLen)
        ee.emit(proxy, 'length', proxy, pos, 'length', initLen, target.length)
      }
      return result
    }
  },

  unshift: (target: ArrayBox, proxy: ArrayBox, getBox: any) => function (...args: []) {
    const items = getBox(args)
    if (!target.__isWatched) return target.unshift(...items)
    const firstIndexChanged = arguments.length
    let i = firstIndexChanged
    while (i--) {
      const value = items[i]
      target.unshift(value)
      ee.emit(proxy, '0', proxy, '0', 'insert', undefined, value)
    }
    const len = target.length
    ee.emit(proxy, 'length', proxy, '' + firstIndexChanged, 'length', len - firstIndexChanged, len)
    return target.length
  }
}

export default modifiers
