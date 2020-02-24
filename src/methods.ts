type Fn = (val: any, i: number, proxy: []) => any
type Methods = { [index: string]: any }

// only the array methods that expose the target of the proxy
const methods: Methods = {
  every: (arr: [], proxy: []) => (fn: Fn) => arr.every((val, i) => fn(val, i, proxy)),
  filter: (arr: [], proxy: []) => (fn: Fn) => arr.filter((val, i) => fn(val, i, proxy)),
  find: (arr: [], proxy: []) => (fn: Fn) => arr.find((val, i) => fn(val, i, proxy)),
  findIndex: (arr: [], proxy: []) => (fn: Fn) => arr.findIndex((val, i) => fn(val, i, proxy)),
  flatMap: (arr: [], proxy: []) => (fn: Fn) => arr.flatMap((val, i) => fn(val, i, proxy)),
  forEach: (arr: [], proxy: []) => (fn: Fn) => arr.forEach((val, i) => fn(val, i, proxy)),
  map: (arr: [], proxy: []) => (fn: Fn) => arr.map((val, i) => fn(val, i, proxy)),
  reduce: (arr: any[], proxy: []) => function (fn: Fn, init?: any) {
    return '1' in arguments
      ? arr.reduce((val, i) => fn(val, i, proxy), init)
      : arr.reduce((val, i) => fn(val, i, proxy))
  },
  reduceRight: (arr: any[], proxy: []) => function (fn: Fn, init: any) {
    return '1' in arguments
      ? arr.reduceRight((val, i) => fn(val, i, proxy), init)
      : arr.reduceRight((val, i) => fn(val, i, proxy))
  },
  some: (arr: [], proxy: []) => (fn: Fn) => arr.some((val, i) => fn(val, i, proxy))
}

export default methods
