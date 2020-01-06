const getModifiers = require('./modifiers.js')
const arrayMethods = require('./array-methods.js')

const ProtoBox = {}
const links = new Map()
const modifiers = getModifiers(links, assignValue)

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

function Box (origin) {
  if (Array.isArray(origin)) {
    return createArrayBox(origin)
  } else if (typeof origin === 'object' && origin !== null) {
    return createObjectBox(origin)
  } else {
    throw new Error('Wrong origin creating new Box')
  }
}

const objectHandler = {
  get: (...args) => Reflect.get(...args),
  set: false,
  getPrototypeOf: () => ProtoBox
}

function createObjectBox (origin) {
  const obj = {}
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, objectHandler)
  links.set(proxy, obj)
  return proxy
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
  links.set(proxy, arr)
  return proxy
}

module.exports = { Box, ...modifiers }
