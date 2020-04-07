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
      start = start < 0 ? len + start : start
      end = end < 0
        ? len + end
        : end > target.length
          ? target.length
          : end
      if (end <= start) return
      const changes = []
      while (start < end) {
        const oldValue = target[start]
        target[start] = value
        if (oldValue !== value) changes.push([proxy, start + '', 'set', oldValue, value])
        ++start
      }
      changes.forEach(change => {
        const [, pos, , oldValue, newVal] = change
        ee.emit(proxy, pos, 'set', pos, oldValue, newVal, proxy)
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
    const changes = []
    let count = 0
    const dist = len - 1
    while (count < half) {
      const oldValue = target[dist - count]
      const newValue = target[count]
      changes.push(['' + count, 'swap', oldValue, newValue, false])
      changes.push(['' + (dist - count) + '', 'swap', newValue, oldValue, true])
      ++count
    }
    changes.forEach(change => {
      const [pos, , oldVal, newVal, encore] = change
      ee.emit(proxy, pos as string, 'swap', oldVal, newVal, encore, proxy)
    })
    return proxy
  },

  shift: (target: [], proxy: []) => () => {
    const shifted = target.shift()
    ee.emit(proxy, '0', 'remove', shifted, undefined, proxy)
    ee.emit(proxy, 'length', target.length, 0, undefined, proxy)
    return shifted
  },

  sort (target: [], proxy: []) {
    return function (fn: (a: any, b: any) => number) {
      const copy = [...target]
      target.sort(fn)
      target.forEach((item, i) => {
        const oldValue = copy[i]
        if (item !== oldValue) {
          ee.emit(proxy, '' + i, 'set', oldValue, item, proxy)
        }
      })
      return proxy
    }
  },

  splice: (target: any[], proxy: [], Box: any) => {
    return function (start: number, deleteCount?: number, ...entries: []) {
      const len = target.length
      const items = entries
        ? entries.map(Box)
        : []
      start = start > len
        ? len
        : start > -1
          ? start
          : len > -start
            ? len + start
            : 0

      const diff = len - start
      deleteCount = '1' in arguments && deleteCount as number < diff
        ? deleteCount as number
        : diff

      const iLen = items.length
      const changes = []
      const min = Math.min(deleteCount, iLen)

      let count = 0
      while (count < min) {
        const index = start + count
        const oldValue = target[index]
        const newValue = items[count]
        if (oldValue !== newValue) {
          changes.push(['' + index, 'set', oldValue, newValue])
        }
        count++
      }

      let indexChanged = false
      let firstIndexChanged
      if (deleteCount < iLen) {
        firstIndexChanged = start + count + 1
        indexChanged = true
        while (count < iLen) {
          const index = start + count
          changes.push(['' + index, 'insert', undefined, items[count]])
          count++
        }
      } else if (deleteCount > iLen) {
        firstIndexChanged = start + count
        indexChanged = true
        while (count < deleteCount) {
          const index = start + count
          changes.push(['' + index, 'remove', target[index]])
          count++
        }
      }

      if (indexChanged) {
        changes.push(['length', target.length + iLen - deleteCount, firstIndexChanged])
      }
      const removed = target.splice(start, deleteCount as number, ...items)
      changes.forEach(change => {
        const [pos, kind, oldVal, newVal] = change
        ee.emit(proxy, pos, kind, oldVal, newVal, proxy)
      })
      return removed
    }
  },

  unshift: (target: any[], proxy: any[], Box: any) => function () {
    const firstIndexChanged = arguments.length
    let i = firstIndexChanged
    while (i--) {
      const value = Box(arguments[i])
      target.unshift(value)
      ee.emit(proxy, '0', 'insert', undefined, value, proxy)
    }
    ee.emit(proxy, 'length', target.length, firstIndexChanged, proxy)
    return target.length
  }
}

export default modifiers
