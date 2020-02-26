import arrayMethods from './methods'
import ee from './ee'
import { EventController } from 'weak-emitter'
import modifiers from './modifiers'
import { isObject, isBox, setHiddenKey } from './tools'
const links = new Map()

type Prox = { [index: string]: any }

function setHandler (target: Prox, prop: string, value: any, proxy: Prox) {
  const oldValue = target[prop]
  if (oldValue === value) return value
  const link = links.get(target)
  const newValue = getBox(value)
  link[prop] = newValue
  ee.emit(proxy, prop, 'set', oldValue, newValue)
  return newValue
}

function arrGetHandler (target: Prox, prop: string, proxy: Prox) {
  const method = arrayMethods[prop] || modifiers[prop]
  return method
    ? method(target, proxy, getBox)
    : target[prop]
}

export function getBox (origin: any): Prox {
  if (!origin || !isObject(origin) || isBox(origin)) {
    return origin
  }
  const isArray = Array.isArray(origin)
  const target: Prox = isArray ? [] : {}
  setHiddenKey(target, '__isBox', true)
  Object.keys(origin).forEach(key => {
    target[key] = getBox(origin[key])
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
      ee.emit(proxy, prop, 'delete', oldValue)
      return true
    }
  })
  links.set(target, target)
  return proxy
}

type EventHandler = (...args: any[]) => void

// TODO: fix this slow mess
export function on (box: Prox, prop: string, handler: EventHandler) {
  if (!prop.includes('.')) {
    return ee.on(box, prop, handler)
  }

  const props = prop.split('.')
  let len = props.length - 1
  const propName = props[len]

  const scopes = [box]
  props.forEach(propName => {
    const localBox = scopes[scopes.length - 1][propName] || {}
    scopes.push(localBox)
  })

  const controllers: EventController[] = []
  const finalEventController = ee.on(scopes[len], propName, handler)
  controllers.unshift(finalEventController)

  while (--len >= 0) {
    const localProp = props[len]
    const localScope = scopes[len]
    const n = len + 1
    const eventController = ee.on(localScope, localProp, (_, oldValue, newValue) => {
      const nextController = controllers[n]
      const currentProp = props[n]
      const nextScope = typeof newValue === 'object' ? newValue : {}
      const prevScope = oldValue && typeof oldValue === 'object' ? oldValue : {}
      const nextValue = nextScope[currentProp]
      const prevValue = prevScope[currentProp]
      nextController.transfer(nextScope)
      nextValue !== prevValue &&
        nextController.emit('set', prevValue, nextValue)
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
