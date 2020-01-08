const ae = require('arbitrary-emitter')
const getModifiers = require('./modifiers.js')
const arrayMethods = require('./array-methods.js')

const ProtoBox = {}
const links = new Map()
const ee = ae()
const modifiers = getModifiers(links, assignAndReturn, ee.emit)

function isBox (obj) {
  return Object.getPrototypeOf(obj) === ProtoBox
}

function isPrimitive (value) {
  const t = typeof value
  return t === 'string' || t === 'number' || t === 'boolean'
}

function assignAndReturn (target, prop, value) {
  const oldValue = target[prop]
  assignValue(target, prop, value)
  return oldValue
}

function assignValue (target, prop, value) {
  target[prop] = isPrimitive(value) || isBox(value)
    ? value
    : new Box(value)
}

function Box (origin) {
  if (typeof origin !== 'object' || origin === null) {
    throw new Error('origin is not type object')
  }
  return Array.isArray(origin)
    ? createArrayBox(origin)
    : createObjectBox(origin)
}

function createObjectBox (origin) {
  const obj = {}
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, {
    get: (...args) => Reflect.get(...args),
    set: false,
    getPrototypeOf: () => ProtoBox,
    deleteProperty: false
  })
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
    set: false,
    getPrototypeOf: () => ProtoBox,
    deleteProperty: false
  })
  links.set(proxy, arr)
  return proxy
}

function on () {
  ee.on(...arguments)
}

function off () {
  ee.off(...arguments)
}

module.exports = { Box, ...modifiers, on, off }
