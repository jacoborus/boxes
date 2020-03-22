export type Prox = { [index: string]: any }

export interface Box {
  __isBox: true
  [ index: string ]: any
}

export function setHiddenKey (target: Prox, key: string, value: any) {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    configurable: true
  })
}

export function isObject (target: Prox): boolean {
  return target && typeof target === 'object'
}

export function isBox (target: any): boolean {
  return target && target.__isBox
}
