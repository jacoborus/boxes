import arrayMethods from './methods'
import ee from './ee'
import modifiers from './modifiers'
import { isObject, isBox, setHiddenKey } from './tools'

const links = new Map()

type Prox = { [index: string]: any }
type List = any[]

export const on = ee.on
export const off = ee.off
export const clear = ee.clear

export function Box (origin: any) {
  if (typeof origin !== 'object' || origin === null) {
    throw new Error('origin is not type object')
  }
  return Array.isArray(origin)
    ? createArrayBox(origin)
    : createObjectBox(origin)
}

function assignValue (target: Prox, prop: string | number, value: any) {
  const newValue = !isObject(value) || isBox(value)
    ? value
    : Box(value)
  target[prop] = newValue
  return newValue
}

function setHandler (target: Prox, prop: string, value: any, proxy: Prox) {
  const oldValue = target[prop]
  if (oldValue === value) return value
  const link = links.get(target)
  const newValue = assignValue(link, prop, value)
  ee.emit(proxy, { prop, oldValue, newValue, kind: 'set' })
  return newValue
}

function createObjectBox (origin: Prox): Prox {
  const obj = {}
  setHiddenKey(obj, '__isBox', true)
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, {
    get: (...args) => Reflect.get(...args),
    set: setHandler,
    deleteProperty (target: Prox, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, { prop, oldValue, kind: 'delete' })
      return true
    }
  })
  links.set(obj, obj)
  return proxy
}

function arrGetHandler (target: Prox, prop: string, proxy: Prox) {
  const method = arrayMethods[prop] || modifiers[prop]
  return method
    ? method(target, proxy, ee)
    : target[prop]
}

function createArrayBox (origin: List): Prox {
  const arr: [] = []
  setHiddenKey(arr, '__isBox', true)
  origin.forEach((value, i) => assignValue(arr, i, value))
  const proxy: Prox = new Proxy(arr, {
    get: arrGetHandler,
    set: setHandler,
    deleteProperty (target: Prox, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, { prop, oldValue, kind: 'delete' })
      return true
    }
  })
  links.set(arr, arr)
  return proxy
}
