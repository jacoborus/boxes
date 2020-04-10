import arrayMethods from './methods'
import ee from './ee'
import { WeakEventController } from 'weak-emitter'
import modifiers from './modifiers'
import { isObject, isBox, setHiddenKey, Box } from './tools'
const links = new Map()

type EventHandler = (...args: any[]) => void

export interface BoxController {
  emit: EventHandler
  off: () => void
}

function setHandler (target: Box, prop: string, value: any, proxy: Box) {
  const oldValue = target[prop]
  if (oldValue === value) return true
  const link = links.get(target)
  const newValue = getBox(value)
  link[prop] = newValue
  ee.emit(proxy, prop, proxy, prop, 'set', oldValue, newValue)
  return true
}

function arrGetHandler (target: Box, prop: string, proxy: Box) {
  const method = arrayMethods[prop] || modifiers[prop]
  return method
    ? method(target, proxy, getBox)
    : target[prop]
}

export function getBox (origin: any): Box {
  if (!origin || !isObject(origin) || isBox(origin)) {
    return origin
  }
  const isArray = Array.isArray(origin)
  const target = isArray ? [] : {}
  setHiddenKey(target, '__isBox', true)
  Object.keys(origin).forEach(key => {
    target[key] = getBox(origin[key])
  })
  const proxy = new Proxy(target, {
    get: isArray
      ? arrGetHandler
      : (...args) => Reflect.get(...args),
    set: setHandler,
    deleteProperty (target: Box, prop: string): any {
      if (!(prop in target)) return true
      const oldValue = target[prop]
      delete target[prop]
      ee.emit(proxy, prop, proxy, prop, 'delete', oldValue, undefined)
      return true
    }
  })
  links.set(target, target)
  return proxy as Box
}

export function on (box: Box, prop: string, handler: EventHandler): BoxController {
  if (!prop.includes('.')) {
    const { off, emit } = ee.on(box, prop, handler)
    return { off, emit }
  }

  const props = prop.split('.')
  let len = props.length - 1
  const propName = props[len]

  const scopes = [box]
  props.forEach(propName => {
    const localBox = scopes[scopes.length - 1][propName] || {}
    scopes.push(localBox)
  })

  const controllers: WeakEventController[] = []
  const finalEventController = ee.on(scopes[len], propName, handler)
  controllers.unshift(finalEventController)

  while (--len >= 0) {
    const localProp = props[len]
    const localScope = scopes[len]
    const n = len + 1
    const eventController = ee.on(localScope, localProp, (_, __, ___, oldValue, newValue) => {
      const nextController = controllers[n]
      const currentProp = props[n]
      const nextScope = typeof newValue === 'object' ? newValue : {}
      const prevScope = oldValue && typeof oldValue === 'object' ? oldValue : {}
      const nextValue = nextScope[currentProp]
      const prevValue = prevScope[currentProp]
      nextController.transfer(nextScope)
      nextValue !== prevValue &&
        nextController.emit(nextScope, currentProp, 'set', prevValue, nextValue)
    })
    controllers.unshift(eventController)
  }
  return {
    emit: handler,
    off () {
      controllers.forEach(controller => controller.off())
    }
  }
}

export const off = ee.off
export { Box } from './tools'
