'use strict'

const subscriptions = new Map()

function trigger (target) {
  let set = subscriptions.get(target)
  if (set) set.forEach(f => f(target))
}

function applySubscribe (action, target) {
  let set = subscriptions.get(target) || subscriptions.set(target, new Set()).get(target)
  set.add(action)
  let subscribed = true
  return () => {
    if (subscribed) {
      set.delete(action)
      subscribed = false
    }
  }
}

function boxes (rootState = {}) {
  let history = [[Object.assign({}, rootState), rootState]]
  let hIndex = 0

  function applyStory ([state, target]) {
    let keys = Object.keys(state)
    // delete properties
    Object.keys(target)
    .filter(i => keys.indexOf(i) < 0)
    .forEach(k => delete target[k])
    // assign properties
    keys.forEach(k => target[k] = state[k])
  }

  function prevState () {
    if (hIndex) {
      applyStory(history[--hIndex])
    }
  }

  function nextState () {
    if (history[hIndex + 1]) {
      applyStory(history[++hIndex])
    }
  }

  function getBox (scope) {
    return {
      get () {
        return scope
      },
      subscribe (action, target) {
        target = target || scope
        return applySubscribe(action, target)
      },
      next () {
        history[++hIndex] = [Object.assign({}, scope), scope]
      },
      getBox (target) {
        if (target) {
          if (typeof target !== 'object') throw new Error('getBox requires a object as param target')
        } else {
          target = scope
        }
        return getBox(target)
      }
    }
  }

  let box = getBox(rootState)
  let store = {
    get: box.get,
    next: box.next,
    subscribe: box.subscribe,
    prevState: prevState,
    nextState: nextState,
    getBox: function (target) {
      target = target || rootState
      box.getBox(target)
    }
  }

  return store
}

module.exports = boxes
