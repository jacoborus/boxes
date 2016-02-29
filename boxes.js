'use strict'

const subscriptions = new Map()

function trigger (target) {
  let set = subscriptions.get(target)
  if (set) set.forEach(f => f(target))
}

function applySubscribe (action, target) {
  let set = subscriptions.get(target) || subscriptions.set(target, new Set()).get(target),
      subscribed = true
  set.add(action)
  return () => {
    if (subscribed) {
      set.delete(action)
      subscribed = false
      if (!set.size) subscriptions.delete(target)
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
    trigger(target)
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

  function createBox (scope) {
    return {
      get () {
        return scope
      },
      onChange (action, target) {
        target = target || scope
        return applySubscribe(action, target)
      },
      save () {
        history.splice(hIndex + 1)
        history[++hIndex] = [Object.assign({}, scope), scope]
        trigger(scope)
      },
      getBox (target) {
        if (target) {
          if (typeof target !== 'object') throw new Error('getBox requires a object as param target')
        } else {
          target = scope
        }
        return createBox(target)
      }
    }
  }

  let box = createBox(rootState)
  return {
    get: box.get,
    save: box.save,
    onChange: box.onChange,
    prevState: prevState,
    nextState: nextState,
    getBox: function (target) {
      target = target || rootState
      return box.getBox(target)
    }
  }
}

module.exports = boxes
