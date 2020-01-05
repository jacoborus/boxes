const ProtoBox = {}
const links = new Map()

const boxHandler = {
  get: (...args) => Reflect.get(...args),
  set: false,
  getPrototypeOf: () => ProtoBox
}

function addBox (proxy, list) {
  links.set(proxy, list)
}

function isBox (obj) {
  return Object.getPrototypeOf(obj) === ProtoBox
}

function isPrimitive (value) {
  const t = typeof value
  return t === 'string' || t === 'number' || t === 'boolean'
}

function assignValue (target, prop, value) {
  target[prop] = isPrimitive(value) || isBox(value)
    ? value
    : new Box(value)
}

const modifiers = {
  set (proxy, prop, value) {
    const link = links.get(proxy)
    assignValue(link, prop, value)
  },
  copyWithin (proxy, ...args) {
    const link = links.get(proxy)
    link.copyWithin(...args)
    return proxy
  },
  fill (proxy, ...args) {
    const link = links.get(proxy)
    link.fill(...args)
    return proxy
  }
}

function Box (origin) {
  if (Array.isArray(origin)) {
    return createArrayBox(origin)
  } else if (typeof origin === 'object' && origin !== null) {
    return createObjectBox(origin)
  } else {
    throw new Error('Wrong origin creating new Box')
  }
}

function createObjectBox (origin) {
  const obj = {}
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, boxHandler)
  addBox(proxy, obj)
  return proxy
}

const arrayMethods = {
  length: arr => arr.length,
  concat: arr => (...args) => arr.concat(...args),
  // entries ??
  every: (arr, proxy) => fn => arr.every((val, i) => fn(val, i, proxy)),
  filter: (arr, proxy) => fn => arr.filter((val, i) => fn(val, i, proxy)),
  find: (arr, proxy) => fn => arr.find((val, i) => fn(val, i, proxy)),
  findIndex: (arr, proxy) => fn => arr.findIndex((val, i) => fn(val, i, proxy)),
  flat: arr => depth => arr.flat(depth),
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

function createArrayBox (origin) {
  const arr = []
  origin.forEach((value, i) => assignValue(arr, i, value))
  const proxy = new Proxy(arr, {
    get (target, prop) {
      if (typeof prop === 'string' && !isNaN(prop)) return target[prop]

      const method = arrayMethods[prop]
      return method
        ? method(target, proxy)
        : undefined
    },
    set: false
  })
  addBox(proxy, arr)
  return proxy
}

module.exports = { Box, ...modifiers }
