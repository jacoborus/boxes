'use strict'

const subscriptions = new Map()
let globalState = {}

function getStory (parent, key) {
  let res = {}
  res[key] = parent[key]
  return { parent, res }
}

function dispatch (link, obj, old) {
  Object.keys(obj).forEach(k => {
    if (obj[k] !== old[k]) {
      if (link.has(k)) {
        link.get(k).forEach(f => f(obj))
      }
    }
  })
}

module.exports = function (name, store = {}) {
  if (!name) throw new Error('boxes needs a name')

  globalState[name] = store
  let res = {}
  res[name] = store
  let hIndex = 0
  let history = [{
    parent: globalState,
    res
  }]

  function getState (prop) {
    if (prop) return globalState[name][prop]
    return globalState[name]
  }

  function update (obj, target = globalState, key = name) {
    history.push(getStory(target, key))
    hIndex++
    let old = target[key]
    let newObject = Object.assign({}, old, obj)
    if (subscriptions.has(old)) {
      let link = subscriptions.set(newObject, subscriptions.get(old)).get(newObject)
      subscriptions.delete(old)
      dispatch(link, newObject, old)
      target[key] = newObject
    } else {
      target[key] = newObject
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

  return { update, prevState, nextState, subscribe, getState }
}
