type Fn = (val: any, i: number, proxy: []) => any
type Methods = { [index: string]: any }

const methods: Methods = {
  length: (arr: []) => arr.length,
  concat: (arr: []) => (...args: []) => arr.concat(...args),
  // entries ??
  every: (arr: [], proxy: []) => (fn: Fn) => arr.every((val, i) => fn(val, i, proxy)),
  filter: (arr: [], proxy: []) => (fn: Fn) => arr.filter((val, i) => fn(val, i, proxy)),
  find: (arr: [], proxy: []) => (fn: Fn) => arr.find((val, i) => fn(val, i, proxy)),
  findIndex: (arr: [], proxy: []) => (fn: Fn) => arr.findIndex((val, i) => fn(val, i, proxy)),
  flat: (arr: []) => (depth: number) => arr.flat(depth),
  flatMap: (arr: [], proxy: []) => (fn: Fn) => arr.flatMap((val, i) => fn(val, i, proxy)),
  forEach: (arr: [], proxy: []) => (fn: Fn) => arr.forEach((val, i) => fn(val, i, proxy)),
  includes: (arr: any[]) => (val: any, fromIndex: number) => arr.includes(val, fromIndex),
  indexOf: (arr: any[]) => (val: any, fromIndex: number) => arr.indexOf(val, fromIndex),
  join: (arr: []) => (separator: string) => arr.join(separator),
  // keys ?
  lastIndexOf: (arr: any[]) => (val: any, fromIndex = -1) => arr.lastIndexOf(val, fromIndex),
  map: (arr: [], proxy: []) => (fn: Fn) => arr.map((val, i) => fn(val, i, proxy)),
  reduce: (arr: any[], proxy: []) => function (fn: Fn, init: any) {
    return '1' in arguments
      ? arr.reduce((val, i) => fn(val, i, proxy), init)
      : arr.reduce((val, i) => fn(val, i, proxy))
  },
  reduceRight: (arr: any[], proxy: []) => function (fn: Fn, init: any) {
    return '1' in arguments
      ? arr.reduceRight((val, i) => fn(val, i, proxy), init)
      : arr.reduceRight((val, i) => fn(val, i, proxy))
  },
  slice: (arr: []) => (begin: number, end: number) => arr.slice(begin, end),
  some: (arr: [], proxy: []) => (fn: Fn) => arr.some((val, i) => fn(val, i, proxy)),
  toLocaleString: (arr: []) => {
    return function (...args: []) {
      return arr.toLocaleString(...args)
    }
  },
  toString: (arr: []) => () => arr.toString()
}

export default methods
