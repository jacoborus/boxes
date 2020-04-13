export type Prox = { [index: string]: any }

export interface Box {
  __isBox: true
  __isWatched: boolean
  [ index: string ]: any
}

export type ArrayBox = any[] & Box

export function setHiddenKey (target: Prox, key: string, value: any): asserts target is Box {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    configurable: true,
    writable: true
  })
}

export function isObject (target: Prox): boolean {
  return target && typeof target === 'object'
}

export function isBox (target: any): boolean {
  return target && target.__isBox
}
