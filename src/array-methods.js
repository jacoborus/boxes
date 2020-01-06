module.exports = {
  length: arr => arr.length,
  concat: arr => (...args) => arr.concat(...args),
  // entries ??
  every: (arr, proxy) => fn => arr.every((val, i) => fn(val, i, proxy)),
  filter: (arr, proxy) => fn => arr.filter((val, i) => fn(val, i, proxy)),
  find: (arr, proxy) => fn => arr.find((val, i) => fn(val, i, proxy)),
  findIndex: (arr, proxy) => fn => arr.findIndex((val, i) => fn(val, i, proxy)),
  flat: arr => depth => arr.flat(depth),
  flatMap: (arr, proxy) => fn => arr.flatMap((val, i) => fn(val, i, proxy)),
  forEach: (arr, proxy) => fn => arr.forEach((val, i) => fn(val, i, proxy)),
  includes: arr => (val, fromIndex) => arr.includes(val, fromIndex),
  indexOf: arr => (val, fromIndex) => arr.indexOf(val, fromIndex),
  join: arr => separator => arr.join(separator),
  // keys ?
  lastIndexOf: arr => (val, fromIndex = -1) => arr.lastIndexOf(val, fromIndex),
  map: (arr, proxy) => fn => arr.map((val, i) => fn(val, i, proxy)),
  reduce: (arr, proxy) => function (fn, init) {
    return '1' in arguments
      ? arr.reduce((val, i) => fn(val, i, proxy), init)
      : arr.reduce((val, i) => fn(val, i, proxy))
  },
  reduceRight: (arr, proxy) => function (fn, init) {
    return '1' in arguments
      ? arr.reduceRight((val, i) => fn(val, i, proxy), init)
      : arr.reduceRight((val, i) => fn(val, i, proxy))
  },
  slice: arr => (begin, end) => arr.slice(begin, end),
  some: (arr, proxy) => fn => arr.some((val, i) => fn(val, i, proxy)),
  toLocaleString: arr => {
    return function () {
      return arr.toLocaleString(...arguments)
    }
  },
  toString: arr => () => arr.toString()
}
