'use strict'

const subscriptions = new Map()
let globalState = {}

function trigger (target, stack) {
  let link = subscriptions.get(target)
  if (link) {
    stack.forEach((v, k) => link.has(k) && link.get(k).forEach(f => f(target)))
  }
}

// TODO: remove set from undo/redo actions (use update instead)
let undoActions = {
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
      let old = key in target ? target[key] : null
      let stack = new Map().set(key, [old, fresh])
      history[hIndex++] = { target, stack, action: 'update' }
      target[key] = fresh
      trigger(target, stack)
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

    let stack = new Map()
    Object.keys(props).forEach(k => {
      let fresh = props[k],
          old = target[k]
      if (old !== fresh) {
        if (fresh !== null) {
          stack.set(k, [old, fresh])
          target[k] = fresh
        } else if (k in target) {
          stack.set(k, [old, fresh])
          delete target[k]
        }
      }
    })

    if (stack.size) {
      history[hIndex++] = { target, stack, action: 'update' }
      trigger(target, stack)
    }
  }

  function clear (prop) {
    clearIn(globalState[name], prop)
  }

  function clearIn (target, prop) {
    let obj = target[prop]
    let stack = new Map()
    if (obj) {
      Object.keys(obj).forEach(k => {
        stack.set(k, [obj[k], null])
        delete obj[k]
      })
    }

    if (stack.size) {
      history[hIndex++] = { target: obj, stack, action: 'update' }
      trigger(obj, stack)
    }
  }

  function prevState () {
    if (hIndex) {
      let story = history[--hIndex]
      undoActions[story.action](story)
      trigger(story.target, story.stack)
    }
  }

  function nextState () {
    if (history[hIndex]) {
      let story = history[hIndex++]
      redoActions[story.action](story)
      trigger(story.target, story.stack)
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

  return {
    get: get,
    set: set, setIn,
    update, updateIn,
    clear, clearIn,
    getBox,
    prevState, nextState,
    subscribe }
}

function has (store) {
  return globalState[store] ? true : false
}

function remove (store) {
  delete globalState[store]
}

module.exports = { createStore, has, remove }
