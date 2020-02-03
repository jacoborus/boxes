type Modifiers = { [index: string]: any }

const modifiers: Modifiers = {
  copyWithin (target: [], proxy: []) {
    return function (targ: number, start: number, end: number) {
      target.copyWithin(targ, start, end)
      return proxy
    }
  },
  fill (target: [], proxy: []) {
    return function (value: never, start?: number, end?: number) {
      target.fill(value, start, end)
      return proxy
    }
  },
  pop: (target: []) => () => target.pop(),
  push: (target: any[]) => function () {
    return target.push(...arguments)
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
