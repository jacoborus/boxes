module.exports = function (links, assign, emit) {
  return {
    set (proxy, prop, value) {
      const link = links.get(proxy)
      const oldValue = assign(link, prop, value)
      emit(proxy, { prop, oldValue })
      return oldValue
    },
    copyWithin (proxy, ...args) {
      const link = links.get(proxy)
      link.copyWithin(...args)
      return proxy
    },
    fill (proxy, ...args) {
      const link = links.get(proxy)
      link.fill(...args)
      return proxy
    },
    pop (proxy) {
      const link = links.get(proxy)
      return link.pop()
    },
    push (proxy, ...args) {
      const link = links.get(proxy)
      return link.push(...args)
    },
    reverse (proxy) {
      const link = links.get(proxy)
      link.reverse()
      return proxy
    },
    shift (proxy) {
      const link = links.get(proxy)
      return link.shift()
    },
    sort (proxy, fn) {
      const link = links.get(proxy)
      link.sort(fn)
      return proxy
    },
    splice (proxy, ...args) {
      const link = links.get(proxy)
      link.splice(...args)
      return proxy
    },
    unshift (proxy, ...args) {
      const link = links.get(proxy)
      return link.unshift(...args)
    }
  }
}
