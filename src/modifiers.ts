import ee from './ee'

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
    return function (targ: number, start = 0, end = target.length) {
      target.copyWithin(targ, start, end)
      return proxy
    }
  },

  // set([position, oldValue, newValue])
  // set([position, oldValue, newValue])
  // ...
  // ])
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
        const oldValue = target[start]
        target[start] = value
        ee.emit(proxy, ['set', start, oldValue, value])
        ++start
      }
      return proxy
    }
  },

  pop (target: any[], proxy: []) {
    return function () {
      const result = target.pop()
      ee.emit(proxy, ['remove', target.length, result])
      return result
    }
  },

  push: (target: any[], proxy: any[], ee: Emitter) => function () {
    Object.keys(arguments).forEach((i: string) => {
      const value = arguments[i as any]
      target[target.length] = value
      ee.emit(proxy, ['insert', target.length - 1, value])
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
      target.sort(fn)
      return proxy
    }
  },

  splice: (target: any[], proxy: []) => {
    return function (start: number, deleteCount?: number, ...items: []) {
      const originalStart = start
      const originalCount = deleteCount
      const len = target.length
      items = items || []
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
        changes.push(['set', pos, target[pos], items[count]])
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

      const removed = target.splice(originalStart, originalCount, ...items)
      changes.forEach(change => ee.emit(proxy, change))
      return removed
    }
  },

  unshift: (target: any[], proxy: []) => function () {
    Object.keys(arguments).reverse().forEach((i: string) => {
      const value = arguments[i as any]
      target.unshift(value)
      ee.emit(proxy, ['insert', 0, value])
    })
    ee.emit(proxy, ['length', target.length])
    return target.length
  }
}

export default modifiers
