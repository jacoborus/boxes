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
        changes.push(['set', '' + pos, target[pos], target[start + count]])
        count++
      }
      target.copyWithin(targ, start, end)
      changes.forEach(change => ee.emit(proxy, change))
      return proxy
    }
  },

  fill (target: any[], proxy: any[]) {
    return function (value: any, start = 0, end = target.length) {
      const len = target.length
      start = start < 0 ? len + start : start
      end = end < 0
        ? len + end
        : end > target.length
          ? target.length
          : end
      if (end <= start) return
      while (start < end) {
        proxy[start] = value
        ++start
      }
      return proxy
    }
  },

  pop (target: any[], proxy: []) {
    return function () {
      const result = target.pop()
      const len = target.length
      ee.emit(proxy, ['remove', len, result])
      ee.emit(proxy, ['length', len])
      return result
    }
  },

  push: (target: any[], proxy: any[], Box: any) => function () {
    Object.keys(arguments).forEach((i: string) => {
      const value = arguments[i as any]
      const len = target.length
      const newValue = Box(value)
      target[len] = newValue
      ee.emit(proxy, ['insert', '' + len, newValue])
    })
    ee.emit(proxy, ['length', target.length])
    return target.length
  },

  reverse (target: [], proxy: []) {
    return function () {
      const len = target.length
      target.reverse()
      const half = Math.floor(len / 2)
      const changes = []
      let count = 0
      const dist = len - 1
      while (count < half) {
        changes.push(['swap', '' + count, dist - count + ''])
        ++count
      }
      changes.forEach(change => ee.emit(proxy, change))
      return proxy
    }
  },

  shift: (target: [], proxy: []) => () => {
    const result = target.shift()
    ee.emit(proxy, ['remove', '0', result])
    ee.emit(proxy, ['length', target.length, 0])
    return result
  },

  sort (target: [], proxy: []) {
    return function (fn: (a: any, b: any) => number) {
      const copy = [...target]
      target.sort(fn)
      target.forEach((item, i) => {
        const oldValue = copy[i]
        if (item !== oldValue) {
          ee.emit(proxy, ['set', '' + i, oldValue, item])
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
          changes.push(['set', '' + index, oldValue, newValue])
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
          changes.push(['insert', '' + index, items[count]])
          count++
        }
      } else if (deleteCount > iLen) {
        firstIndexChanged = start + count
        indexChanged = true
        while (count < deleteCount) {
          const index = start + count
          changes.push(['remove', '' + index, target[index]])
          count++
        }
      }

      if (indexChanged) {
        changes.push(['length', target.length + iLen - deleteCount, firstIndexChanged])
      }
      const removed = target.splice(start, deleteCount as number, ...items)
      changes.forEach(change => ee.emit(proxy, change))
      return removed
    }
  },

  unshift: (target: any[], proxy: any[], Box: any) => function () {
    const firstIndexChanged = arguments.length
    let i = firstIndexChanged
    while (i--) {
      const value = Box(arguments[i])
      target.unshift(value)
      ee.emit(proxy, ['insert', '0', value])
    }
    ee.emit(proxy, ['length', target.length, firstIndexChanged])
    return target.length
  }
}

export default modifiers
