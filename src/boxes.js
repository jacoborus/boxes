const ProtoBox = {}
const ProtoList = []
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

function isList (arr) {
  return Object.getPrototypeOf(arr) === ProtoList
}

function isPrimitive (value) {
  const t = typeof value
  return t === 'string' || t === 'number' || t === 'boolean'
}

function assignValue (target, prop, value) {
  if (isPrimitive(value)) {
    target[prop] = value
  } else if (Array.isArray(value)) {
    target[prop] = List(value)
  } else if (typeof value === 'object' && value !== null) {
    target[prop] = Box(value)
  }
}

function set (proxy, prop, value) {
  const link = links.get(proxy)
  assignValue(link, prop, value)
}

function Box (origin) {
  if (isBox(origin)) return origin
  const obj = {}
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, boxHandler)
  addBox(proxy, obj)
  return proxy
}

const listMethods = {
  length: arr => arr.length,
  forEach: arr => fn => arr.forEach(fn),
  map: arr => fn => arr.map(fn)
}

const listHandler = {
  get (target, prop) {
    if (!isNaN(prop)) return target[prop]

    const method = listMethods[prop]
    return method
      ? method(target)
      : undefined
  },
  set: false
}

function List (origin) {
  if (isList(origin)) return origin
  const arr = []
  origin.forEach(key => {
    const value = origin[key]
    assignValue(arr, key, value)
  })
  const proxy = new Proxy(arr, listHandler)
  addBox(proxy, arr)
  return proxy
}

module.exports = { Box, set, List }
