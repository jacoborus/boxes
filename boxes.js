'use strict'

const subscriptions = new Map()
let globalState = {}

function trigger (target, stack) {
  let link = subscriptions.get(target)
  if (link) {
    stack.forEach((v, k) => link.has(k) && link.get(k).forEach(f => f(target[k])))
  }
}

function undoRedo (story, i) {
  let stack = story.stack,
      target = story.target
  stack.forEach((val, k) => {
    if (val[i] !== null) {
      target[k] = val[i]
    } else if (k in target) {
      delete target[k]
    }
  })
  trigger(story.target, story.stack)
}

function createStore (name, store = {}) {
  if (!name) throw new Error('boxes needs a name')

  globalState[name] = store
  let history = []
  let hIndex = 0

  function get () {
    return globalState[name]
  }

  function applySet (fresh, key = name, target = globalState) {
    if (target[key] !== fresh) {
      let old = key in target ? target[key] : null
      let stack = new Map().set(key, [old, fresh])
      history[hIndex++] = { target, stack, action: 'update' }
      target[key] = fresh
      trigger(target, stack)
    }
  }

  function set (value, key, target) {
    if (1 in arguments) {
      if (!(typeof key === 'string' || typeof key === 'number')) {
        throw new Error('setIn requires a string or number key')
      }
      if (!target) {
        target = globalState[name]
      }
    }
    if (target) {
      if (typeof target !== 'object') {
        throw new Error('setIn requires a object target')
      }
    }
    applySet(value, key, target)
  }

  function update (props, target) {
    if (!props || typeof props !== 'object') throw new Error('update requires a object props')
    if (!(1 in arguments)) {
      target = globalState[name]
    } else if (typeof target !== 'object') {
      throw new Error('update requires a object target')
    }

    let stack = new Map()
    Object.keys(props).forEach(k => {
      let fresh = props[k],
          old = target[k]
      if (old !== fresh) {
        if (fresh !== null) {
          stack.set(k, [old, fresh])
          target[k] = fresh
        } else if (k in target) {
          stack.setIn(k, [old, fresh])
          delete target[k]
        }
      }
    })

    if (stack.size) {
      history[hIndex++] = { target, stack, action: 'update' }
      trigger(target, stack)
    }
  }

  function prevState () {
    if (hIndex) {
      let story = history[--hIndex]
      undoRedo(story, 0)
    }
  }

  function nextState () {
    if (history[hIndex]) {
      let story = history[hIndex++]
      undoRedo(story, 1)
    }
  }

  function subscribe (target, key, action) {
    let map = subscriptions.get(target) || subscriptions.set(target, new Map()).get(target)
    let link = map.get(key) || map.set(key, new Set()).get(key)
    link.add(action)
    return () => link.delete(action)
  }

  function subscribeToStore (action) {
    let map = subscriptions.get(globalState) || subscriptions.set(globalState, new Map()).get(globalState)
    let link = map.get(name) || map.set(name, new Set()).get(name)
    link.add(action)
    return () => link.delete(action)
  }

  function getBox (scope) {
    return {
      get () {
        return scope
      },
      set (value, key) {
        applySet(value, key, scope)
      },
      update (props, target) {
        if (!(1 in arguments)) target = scope
        update(target, props)
      },
      subscribe, getBox
    }
  }

  return {
    get: get,
    set: set,
    update,
    getBox,
    prevState, nextState,
    subscribe, subscribeToStore }
}

function has (store) {
  return globalState[store] ? true : false
}

function remove (store) {
  delete globalState[store]
}

module.exports = { createStore, has, remove }
