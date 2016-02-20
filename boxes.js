'use strict'

const subscriptions = new Map()
let globalState = {}

function getStory (parent, key) {
  return { parent, key, value: parent[key] }
}

// delete all subscriptions of a given object
function unlinkInside (target) {
  Object.keys(target).forEach(k => {
    if (typeof target[k] === 'object') {
      subscriptions.delete(target[k])
      unlinkInside(target[k])
      delete target[k]
    }
  })
}

function createBox (name, store = {}) {
  if (!name) throw new Error('boxes needs a name')

  globalState[name] = store
  let history = []
  let hIndex = 0

  function get (prop) {
    if (prop) return globalState[name][prop]
    return globalState[name]
  }

  function set (key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setAt requires a string key')
    }
    let target = globalState[name]
    if (target[key] !== value) {
      history.push(getStory(target, key))
      hIndex++
      target[key] = value
      let link = subscriptions.get(target)
      if (link && link.has(key)) {
        link.get(key).forEach(f => f(target))
        if (typeof value !== 'object') {
          unlinkInside(target)
        }
      }
    }
  }

  function prevState () {
    if (hIndex) {
      let story = history[--hIndex]
      story.parent[story.key] = story.value
    }
  }

  function nextState () {
    if (history[hIndex]) {
      let story = history[hIndex++]
      story.parent = Object.assign(story.parent, story.res)
    }
  }

  function subscribe (target, key, action) {
    let map = subscriptions.get(target) || subscriptions.set(target, new Map()).get(target)
    let link
    if (typeof target[key] === 'object') {
      link = map.get('__') || map.set('__', new Set()).get('__')
    } else {
      link = map.get(key) || map.set(key, new Set()).get(key)
    }
    link.add(action)
    return () => link.delete(action)
  }

  return { get: get, set: set, prevState, nextState, subscribe }
}

function has (boxName) {
  return globalState[boxName] ? true : false
}

function remove (boxName) {
  delete globalState[boxName]
}

module.exports = { createBox, has, remove }
