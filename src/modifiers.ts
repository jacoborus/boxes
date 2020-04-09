import ee from './ee'

type Modifiers = { [index: string]: any }

const modifiers: Modifiers = {
  copyWithin (target: [], proxy: []) {
    return function (targ: number, start = 0, end: number = target.length) {
      const len = target.length
      if (targ < 0) targ = len + targ
      if (targ >= len) return
      if (start < 0) start = len + start
      if (end < 0) end = len + end
      const total = end - start
      const changes = []
      let count = 0
      while (count < total && targ + count < len) {
        const pos = targ + count
        changes.push(['' + pos, 'set', target[pos], target[start + count]])
        count++
      }
      target.copyWithin(targ, start, end)
      changes.forEach(change => {
        const [pos, kind, oldVal, newVal] = change
        ee.emit(proxy, pos, kind, pos, oldVal, newVal, proxy)
      })
      return proxy
    }
  },

  fill (target: any[], proxy: any[], getBox: any) {
    return function (value: any, start = 0, end = target.length) {
      value = getBox(value)
      const len = target.length
      if (start < 0) start += len
      if (end < 0) end += len
      else if (end > len) end = len
      if (end <= start) return proxy
      const changes = []
      while (start < end) {
        const oldValue = target[start]
        target[start] = value
        const startStr = start.toString()
        if (oldValue !== value) changes.push([startStr, oldValue, value])
        ++start
      }
      changes.forEach(([startStr, oldValue, value]) => {
        ee.emit(proxy, startStr, 'set', startStr, oldValue, value, proxy)
      })
      return proxy
    }
  },

  pop: (target: any[], proxy: []) => () => {
    const result = target.pop()
    const len = target.length
    const lenStr = len.toString()
    ee.emit(proxy, lenStr, 'remove', lenStr, result, undefined, proxy)
    ee.emit(proxy, 'length', 'length', undefined, len + 1, len, proxy)
    return result
  },

  push: (target: any[], proxy: any[], getBox: any) => function (...args: []) {
    args.forEach((value: any) => {
      const len = target.length
      const newValue = getBox(value)
      target[len] = newValue
      ee.emit(proxy, '' + len, 'insert', '' + len, undefined, newValue, proxy)
    })
    const len = target.length
    ee.emit(proxy, 'length', 'length', undefined, len - args.length, len, proxy)
    return target.length
  },

  reverse: (target: [], proxy: []) => () => {
    const len = target.length
    target.reverse()
    const half = Math.floor(len / 2)
    let count = 0
    const dist = len - 1
    while (count < half) {
      const distCount = dist - count
      const oldValue = target[distCount]
      const newValue = target[count]
      const countStr = count.toString()
      const distCountStr = distCount.toString()
      ee.emit(proxy, countStr, 'swap', countStr, oldValue, newValue, proxy)
      ee.emit(proxy, distCountStr, 'swap', distCountStr, newValue, oldValue, proxy)
      ++count
    }
    return proxy
  },

  shift: (target: [], proxy: []) => () => {
    const shifted = target.shift()
    ee.emit(proxy, '0', 'remove', '0', shifted, undefined, proxy)
    const len = target.length
    ee.emit(proxy, 'length', 'length', '0', len + 1, len, proxy)
    return shifted
  },

  sort (target: [], proxy: []) {
    return function (fn: (a: any, b: any) => number) {
      const copy = [...target]
      target.sort(fn)
      target.forEach((item, i) => {
        const oldValue = copy[i]
        if (item !== oldValue) {
          ee.emit(proxy, '' + i, 'swap', '' + i, oldValue, item, proxy)
        }
      })
      return proxy
    }
  },

  splice: (target: any[], proxy: [], getBox: any) => {
    return function (start: number, deleteCount?: number, ...entries: []) {
      const initLen = target.length
      const items = getBox(entries || [])
      start = start > initLen
        ? initLen
        : start > -1
          ? start
          : initLen > -start
            ? initLen + start
            : 0
      const nopos = !('1' in arguments) || deleteCount as number + start > initLen
      const dCount = nopos
        ? initLen - start
        : deleteCount as number

      if (dCount + start > initLen) deleteCount = initLen - start
      const result = getBox(target.splice(start, dCount, ...items) || [])
      const resultLen = result.length
      const itemsLen = items.length
      const max = Math.max(resultLen, itemsLen, dCount)
      let count = 0
      while (count < max) {
        const pos = (start + count).toString()
        const oldValue = result[count]
        const newValue = items[count]
        const kind = resultLen > count && itemsLen > count
          ? 'set'
          : itemsLen > count
            ? 'insert'
            : 'remove'
        ee.emit(proxy, pos, kind, pos, oldValue, newValue, proxy)
        ++count
      }
      if (itemsLen !== resultLen) {
        const pos = nopos ? undefined : (start + itemsLen).toString()
        ee.emit(proxy, 'length', 'length', pos, initLen, target.length, proxy)
      }
      return result
    }
  },

  unshift: (target: any[], proxy: any[], getBox: any) => function () {
    const firstIndexChanged = arguments.length
    let i = firstIndexChanged
    while (i--) {
      const value = getBox(arguments[i])
      target.unshift(value)
      ee.emit(proxy, '0', 'insert', '0', undefined, value, proxy)
    }
    const len = target.length
    ee.emit(proxy, 'length', 'length', '' + firstIndexChanged, len - firstIndexChanged, len, proxy)
    return target.length
  }
}

export default modifiers
