'use strict'

const subscriptions = new Map()
let globalState = {}

function getStory (parent, key, fresh) {
  return { parent, key, old: parent[key], fresh }
}

function createBox (name, store = {}) {
  if (!name) throw new Error('boxes needs a name')

  globalState[name] = store
  let history = []
  let hIndex = 0

  function get () {
    return globalState[name]
  }

  function set (key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setAt requires a string key')
    }
    let target = globalState[name]
    if (target[key] !== value) {
      history.push(getStory(target, key, value))
      hIndex++

      target[key] = value
      let link = subscriptions.get(target)
      if (link && link.has(key)) {
        link.get(key).forEach(f => f(target))
      }
    }
  }

  function setIn (target, key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setIn requires a string key')
    }
    if (!target || typeof target !== 'object') {
      throw new Error('setIn requires a object target')
    }
    if (target[key] !== value) {
      history.push(getStory(target, key, value))
      hIndex++

      target[key] = value
      let link = subscriptions.get(target)
      if (link && link.has(key)) {
        link.get(key).forEach(f => f(target))
      }
    }
  }

  function prevState () {
    if (hIndex) {
      let story = history[--hIndex]
      story.parent[story.key] = story.old
    }
  }

  function nextState () {
    if (history[hIndex]) {
      let story = history[hIndex++]
      story.parent[story.key] = story.fresh
    }
  }

  function subscribe (target, key, action) {
    let map = subscriptions.get(target) || subscriptions.set(target, new Map()).get(target)
    let link = map.get(key) || map.set(key, new Set()).get(key)
    link.add(action)
    return () => link.delete(action)
  }

  return { get: get, set: set, setIn, prevState, nextState, subscribe }
}

function has (boxName) {
  return globalState[boxName] ? true : false
}

function remove (boxName) {
  delete globalState[boxName]
}

module.exports = { createBox, has, remove }
