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
  fill (target: any[], proxy: any[]) {
    return function (value: any, start = 0, end = target.length) {
      target.fill(value, start, end)
      return proxy
    }
  },
  push: (target: any[], proxy: any[], ee: Emitter) => function () {
    Object.keys(arguments).forEach((i: string) => {
      proxy[target.length] = arguments[i as any]
    })
    ee.emit(proxy, 'length')
    return target.length
  },
  reverse (target: [], proxy: []) {
    return function () {
      target.reverse()
      return proxy
    }
  },
  // shift: (target: []) => () => target.shift(),
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
