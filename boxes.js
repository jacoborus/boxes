'use strict'

const subscriptions = new Map()
let globalState = {}

function trigger (target, keys) {
  let link = subscriptions.get(target)
  if (link) {
    keys.forEach(k => link.has(k) && link.get(k).forEach(f => f(target)))
  }
}

let undoActions = {
  set (story) {
    story.target[story.key] = story.old
  },
  update (story) {
    let stack = story.stack,
        target = story.target
    stack.forEach((val, k) => {
      if (val[0] !== null) {
        target[k] = val[0]
      } else if (k in target) {
        delete target[k]
      }
    })
  }
}

let redoActions = {
  set (story) {
    story.target[story.key] = story.fresh
  },
  update (story) {
    let stack = story.stack,
        target = story.target
    stack.forEach((val, k) => {
      if (val[1] !== null) {
        target[k] = val[1]
      } else if (k in target) {
        delete target[k]
      }
    })
  }
}

function createStore (name, store = {}) {
  if (!name) throw new Error('boxes needs a name')

  globalState[name] = store
  let history = []
  let hIndex = 0

  function get () {
    return globalState[name]
  }

  function applySet (target, key, fresh) {
    if (target[key] !== fresh) {
      history[hIndex++] = {
        target, key, fresh,
        old: target[key],
        action: 'set',
        keys: new Set().add(key)
      }
      target[key] = fresh
      trigger(target, [key])
    }
  }

  function set (key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setAt requires a string key')
    }
    applySet(globalState[name], key, value)
  }

  function setIn (target, key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setIn requires a string key')
    }
    if (!target || typeof target !== 'object') {
      throw new Error('setIn requires a object target')
    }
    applySet(target, key, value)
  }

  function update (props) {
    updateIn(globalState[name], props)
  }

  function updateIn (target, props) {
    if (typeof target !== 'object') throw new Error('update requires a object target')
    if (typeof props !== 'object') throw new Error('update requires a object props')

    let stack = new Map(),
        keys = new Set()
    Object.keys(props).forEach(k => {
      let fresh = props[k],
          old = target[k]
      if (old !== fresh) {
        if (fresh !== null) {
          stack.set(k, [old, fresh])
          keys.add(k)
          target[k] = fresh
        } else if (k in target) {
          stack.set(k, [old, fresh])
          keys.add(k)
          delete target[k]
        }
      }
    })

    if (keys.size) {
      history[hIndex++] = { target, stack, keys, action: 'update' }
      trigger(target, keys)
    }
  }

  function prevState () {
    if (hIndex) {
      let story = history[--hIndex]
      undoActions[story.action](story)
      trigger(story.target, story.keys)
    }
  }

  function nextState () {
    if (history[hIndex]) {
      let story = history[hIndex++]
      redoActions[story.action](story)
      trigger(story.target, story.keys)
    }
  }

  function subscribe (target, key, action) {
    let map = subscriptions.get(target) || subscriptions.set(target, new Map()).get(target)
    let link = map.get(key) || map.set(key, new Set()).get(key)
    link.add(action)
    return () => link.delete(action)
  }

  function getBox (target) {
    return {
      get () {
        return target
      },
      set (key, value) {
        if (!key || typeof key !== 'string') {
          throw new Error('set requires a string key')
        }
        applySet(target, key, value)
      },
      update (props) {
        updateIn(target, props)
      },
      setIn, updateIn, subscribe, getBox
    }
  }

  return { get: get, set: set, setIn, update, updateIn, getBox, prevState, nextState, subscribe }
}

function has (store) {
  return globalState[store] ? true : false
}

function remove (store) {
  delete globalState[store]
}

module.exports = { createStore, has, remove }
