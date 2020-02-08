import arrayMethods from './methods'
import ee from './ee'
import modifiers from './modifiers'
import { isObject, isBox, setHiddenKey } from './tools'
const links = new Map()

type Prox = { [index: string]: any }

function setHandler (target: Prox, prop: string, value: any, proxy: Prox) {
  const oldValue = target[prop]
  if (oldValue === value) return value
  const link = links.get(target)
  const newValue = Box(value)
  link[prop] = newValue
  ee.emit(proxy, ['set', prop, oldValue, newValue])
  return newValue
}

function arrGetHandler (target: Prox, prop: string, proxy: Prox) {
  const method = arrayMethods[prop] || modifiers[prop]
  return method
    ? method(target, proxy, Box)
    : target[prop]
}

export function Box (origin: any): Prox {
  if (!origin || !isObject(origin) || isBox(origin)) {
    return origin
  }
  const isArray = Array.isArray(origin)
  const target: Prox = isArray ? [] : {}
  setHiddenKey(target, '__isBox', true)
  Object.keys(origin).forEach(key => {
    target[key] = Box(origin[key])
  })
  const proxy = new Proxy(target, {
    get: isArray
      ? arrGetHandler
      : (...args) => Reflect.get(...args),
    set: setHandler,
    deleteProperty (target: Prox, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, ['delete', prop, oldValue])
      return true
    }
  })
  links.set(target, target)
  return proxy
}

export const on = ee.on
export const off = ee.off
export const clear = ee.clear
