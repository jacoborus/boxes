import arrayMethods from './methods'
import ee from './ee'
import modifiers from './modifiers'
import { isObject, isBox, setHiddenKey } from './tools'

const links = new Map()

type Prox = { [index: string]: any }

export const on = ee.on
export const off = ee.off
export const clear = ee.clear

export function Box (origin: any) {
  if (typeof origin !== 'object' || origin === null) {
    throw new Error('origin is not type object')
  }
  return createBox(origin)
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

function arrGetHandler (target: Prox, prop: string, proxy: Prox) {
  const method = arrayMethods[prop] || modifiers[prop]
  return method
    ? method(target, proxy, ee)
    : target[prop]
}

function createBox (origin: Prox): Prox {
  const isArray = Array.isArray(origin)
  const target = isArray ? [] : {}
  setHiddenKey(target, '__isBox', true)
  Object.keys(origin).forEach(key => {
    assignValue(target, key, origin[key])
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
      ee.emit(proxy, { prop, oldValue, kind: 'delete' })
      return true
    }
  })
  links.set(target, target)
  return proxy
}
