import ee from './ee'
import { Box } from './boxes'

type Modifiers = { [index: string]: any }
type Handler = (...args: any[]) => void

interface Emitter {
  on(key: object, handler: Handler): void
  once(key: object, handler: Handler): void
  emit(key: object, ...args: any[]): void
  clear(key: object): void
  off(key: object, handler: Handler): void
  transfer(origin: object, destination: object): void
}

const modifiers: Modifiers = {
  copyWithin (target: [], proxy: []) {
    return function (targ: number, start = 0, end: number = target.length) {
      const len = target.length
      if (targ >= len) return
      if (targ < 0) targ = len + targ
      if (start < 0) start = len + start
      if (end < 0) end = len + end
      const total = end - start
      const changes = []
      let count = 0
      while (count < total && targ + count < len) {
        const pos = targ + count
        changes.push(['set', '' + pos, target[pos], target[start + count]])
        count++
      }
      target.copyWithin(targ, start, end)
      changes.forEach(change => ee.emit(proxy, change))
      return proxy
    }
  },

  fill (target: any[], proxy: any[]) {
    return function (value: any, start = 0, end = target.length) {
      const len = target.length
      start = start < 0 ? len + start : start
      end = end < 0
        ? len + end
        : end > target.length
          ? target.length
          : end
      if (end <= start) return
      while (start < end) {
        proxy[start] = value
        ++start
      }
      return proxy
    }
  },

  pop (target: any[], proxy: []) {
    return function () {
      const result = target.pop()
      const len = target.length
      ee.emit(proxy, ['remove', len, result])
      ee.emit(proxy, ['length', len])
      return result
    }
  },

  push: (target: any[], proxy: any[], ee: Emitter) => function () {
    Object.keys(arguments).forEach((i: string) => {
      const value = arguments[i as any]
      proxy[target.length] = value
    })
    ee.emit(proxy, ['length', target.length])
    return target.length
  },

  reverse (target: [], proxy: []) {
    return function () {
      target.reverse()
      ee.emit(proxy, ['reverse'])
      return proxy
    }
  },

  shift: (target: [], proxy: []) => () => {
    const result = target.shift()
    ee.emit(proxy, ['remove', 0, result])
    ee.emit(proxy, ['length', target.length])
    return result
  },

  sort (target: [], proxy: []) {
    return function (fn: (a: any, b: any) => number) {
      const copy = [...target]
      target.sort(fn)
      target.forEach((item, i) => {
        const oldValue = copy[i]
        if (item !== oldValue) {
          ee.emit(proxy, ['set', '' + i, oldValue, item])
        }
      })
      return proxy
    }
  },

  splice: (target: any[], proxy: []) => {
    return function (start: number, deleteCount?: number, ...entries: []) {
      const originalStart = start
      const originalCount = deleteCount
      const len = target.length
      const items = entries
        ? entries.map(Box)
        : []
      start = start > len
        ? len
        : start > -1
          ? start
          : len > -start
            ? len + start
            : 0

      const diff = len - start
      deleteCount = '1' in arguments && deleteCount as number < diff
        ? deleteCount as number
        : diff

      const iLen = items.length
      const changes = []
      const min = Math.min(deleteCount, iLen)

      let count = 0
      while (count < min) {
        const pos = start + count
        const oldValue = target[pos]
        const newValue = items[count]
        if (oldValue !== newValue) {
          changes.push(['set', pos, oldValue, newValue])
        }
        count++
      }
      if (deleteCount < iLen) {
        while (count < iLen) {
          changes.push(['insert', start + count, items[count]])
          count++
        }
        changes.push(['length', target.length + iLen - deleteCount])
      } else if (deleteCount > iLen) {
        while (count < deleteCount) {
          const pos = start + count
          changes.push(['remove', pos, target[pos]])
          count++
        }
        changes.push(['length', target.length + iLen - deleteCount])
      }

      const removed = target.splice(originalStart, originalCount as number, ...items)
      changes.forEach(change => ee.emit(proxy, change))
      return removed
    }
  },

  unshift: (target: any[], proxy: any[]) => function () {
    let i = arguments.length
    while (i--) {
      const value = Box(arguments[i])
      target.unshift(value)
      ee.emit(proxy, ['insert', 0, value])
    }
    ee.emit(proxy, ['length', target.length])
    return target.length
  }
}

export default modifiers
