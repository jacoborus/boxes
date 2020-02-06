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
      return proxy
    }
  },

  shift: (target: []) => () => target.shift(),

  sort (target: [], proxy: []) {
    return function (fn: (a: any, b: any) => number) {
      target.sort(fn)
      return proxy
    }
  },

  splice: (target: any[], proxy: []) => {
    return function (start: number, deleteCount: number, ...items: []) {
      target.splice(start, deleteCount, ...items)
      return proxy
    }
  },

  unshift: (target: any[]) => function () {
    return target.unshift(...arguments)
  }
}

export default modifiers
