'use strict'

const subscriptions = new Map()
let globalState = {}

function getStory (parent, key) {
  let res = {}
  res[key] = parent[key]
  return { parent, res }
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
  let res = {}
  res[name] = store
  let hIndex = 0
  let history = [{
    parent: globalState,
    res
  }]

  function get (prop) {
    if (prop) return globalState[name][prop]
    return globalState[name]
  }

  function set (key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('setAt requires a string key')
    }
    let target = globalState[name]
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

  function prevState () {
    if (hIndex) {
      let story = history[hIndex--]
      story.parent = Object.assign(story.parent, story.res)
    }
  }

  function nextState () {
    if (history[hIndex + 1]) {
      let story = history[++hIndex]
      story.parent = Object.assign(story.parent, story.res)
    }
  }

  function subscribe (target, key, action) {
    let links
    if (subscriptions.has(target)) {
      links = subscriptions.get(target)
    } else {
      links = subscriptions.set(target, new Map()).get(target)
    }
    let link = links.get(key) || links.set(key, new Set()).get(key)
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
