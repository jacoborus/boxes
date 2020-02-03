import { weakEmitter } from 'weak-emitter'
import arrayMethods from './array-methods'

const ProtoBox = {}
const links = new Map()
const ee = weakEmitter()

export const on = ee.on
export const off = ee.off
export const clear = ee.clear
export function isBox (target: any): boolean {
  return Object.getPrototypeOf(target) === ProtoBox
}

export function Box (origin: any) {
  if (typeof origin !== 'object' || origin === null) {
    throw new Error('origin is not type object')
  }
  return Array.isArray(origin)
    ? createArrayBox(origin)
    : createObjectBox(origin)
}

function isPrimitive (value: any) {
  const t = typeof value
  return t === 'string' || t === 'number' || t === 'boolean'
}

function assignValue (target: any, prop: string | number, value: any) {
  const newValue = isPrimitive(value) || isBox(value)
    ? value
    : Box(value)
  target[prop] = newValue
  return newValue
}

type Prox = { [index: string]: any }

function createObjectBox (origin: Prox): Prox {
  const obj = {}
  Object.keys(origin).forEach(key => {
    const value = origin[key]
    assignValue(obj, key, value)
  })
  const proxy = new Proxy(obj, {
    get: (...args) => Reflect.get(...args),
    set (target: Prox, prop: string, value: any) {
      const oldValue = target[prop]
      if (oldValue === value) return value
      const link = links.get(target)
      const newValue = assignValue(link, prop, value)
      ee.emit(proxy, { prop, oldValue })
      return newValue
    },
    deleteProperty (target: Prox, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, { prop, oldValue })
      return true
    },
    getPrototypeOf: () => ProtoBox
  })
  links.set(obj, obj)
  return proxy
}

type List = any[]

function createArrayBox (origin: List): Prox {
  const arr: [] = []
  origin.forEach((value, i) => assignValue(arr, i, value))
  const proxy: Prox = new Proxy(arr, {
    get (target: Prox, prop: string) {
      if (typeof prop === 'string' && !isNaN(prop as any)) {
        return target[prop]
      }

      const method = arrayMethods[prop]
      return method
        ? method(target, proxy)
        : undefined
    },
    set (target: Prox, prop: string, value: any): any {
      const oldValue = target[prop]
      if (oldValue === value) return value
      const link = links.get(target)
      const newValue = assignValue(link, prop, value)
      ee.emit(proxy, { prop, oldValue })
      return newValue
    },
    deleteProperty (target: Prox, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, { prop, oldValue })
      return true
    },
    getPrototypeOf: () => ProtoBox
  })
  links.set(arr, arr)
  return proxy
}
